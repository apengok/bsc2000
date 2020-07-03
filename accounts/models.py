# -*- coding:utf-8 -*-
from django.db import models
from django.db import models
from django.contrib.auth.models import (
    BaseUserManager, AbstractBaseUser,PermissionsMixin,Group,_user_has_perm
)
from django.contrib.auth.signals import user_logged_in
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save
from django.db.models.signals import pre_save
import json
from django.db.models import Q

from core.utils import unique_rid_generator

from core.models import Organization

class MyRolesManager(models.Manager):
    """
    The manager for the auth's Group model.
    """
    use_in_migrations = True

    def get_by_natural_key(self, name):
        return self.get(name=name)

class MyRoles(Group):
    """
                      Group.name
    rid:'ROLE_ADMIN',超级管理员
         'POWER_USER',一般管理员
         'ROLE_randomstr',用户创建的角色
    """
    notes           = models.CharField(max_length=156,blank=True)   
    rid             = models.CharField(max_length=1000,blank=True)   #name
    uid             = models.CharField(max_length=100,blank=True)
    permissionTree  = models.TextField(blank=True)
    # permissionTree  = models.CharField(max_length=50000,blank=True)

    belongto     = models.ForeignKey(Organization,related_name='roles',null=True, blank=True,on_delete=models.CASCADE)

    updated = models.DateTimeField(auto_now=True, auto_now_add=False)
    timestamp = models.DateTimeField(auto_now=False, auto_now_add=True)

    objects = MyRolesManager()

    def __unicode__(self):
        return self.name

    def __str__(self):
        return self.name


class OrganUserQuerySet(models.query.QuerySet):
    def search(self, query): 
        if query:
            query = query.strip()
            return self.filter( #icontains
                Q(idstr__iexact=query)|
                Q(belongto__iexact=query)
                ).distinct()
        return self        

class OrganUserManager(models.Manager):
    def get_queryset(self):
        return OrganUserQuerySet(self.model, using=self._db)

    def search(self, query): 
        return self.get_queryset().search(query)
    
class UserManager(BaseUserManager):
    def create_user(self, user_name, password=None):
        """
        Creates and saves a User with the given email and password.
        """
        if not user_name:
            raise ValueError('Users must have an user_name')

        user = self.model(
            user_name=user_name #self.normalize_email(email),
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_staffuser(self, user_name, password):
        """
        Creates and saves a staff user with the given email and password.
        """
        user = self.create_user(
            user_name,
            password=password,
        )
        user.staff = True
        user.save(using=self._db)
        return user

    def create_superuser(self, user_name, password):
        """
        Creates and saves a superuser with the given email and password.
        """
        user = self.create_user(
            user_name,
            password=password,
        )
        user.staff = True
        user.admin = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

    

class User(AbstractBaseUser,PermissionsMixin):

    # email = models.EmailField(
    #     verbose_name='email address',
    #     max_length=255,
    #     unique=True,
    # )
    user_name    = models.CharField(verbose_name='用户名', max_length=30, unique=True)
    real_name    = models.CharField(verbose_name='真实姓名', max_length=30, blank=True)
    sex          = models.CharField(verbose_name='性别', max_length=30, blank=True)
    phone_number = models.CharField(verbose_name='手机',  max_length=30, blank=True)
    # belongto     = models.CharField(_('belongs to'), max_length=30, blank=True)
    belongto     = models.ForeignKey(Organization,verbose_name='所属组织', related_name='users',null=True, blank=True,on_delete=models.CASCADE)
    expire_date  = models.CharField(verbose_name='授权截止日期',  max_length=30, blank=True)
    # Role         = models.CharField(_('Role'), max_length=30, blank=True)
    Role        = models.ForeignKey(MyRoles,verbose_name='角色',related_name='users',null=True, blank=True,on_delete=models.CASCADE)
    idstr       = models.CharField(max_length=300,null=True,blank=True) #(string combind username,group.id,group.pid )
    uuid        = models.CharField(max_length=300,null=True,blank=True)
    email = models.EmailField(
        verbose_name='邮箱',
        max_length=255,
        blank=True,
    )
    # BOOL_CHOICES = ((True, '启用'), (False, '停止'))
    is_active = models.BooleanField(verbose_name='启停状态', default=True)
    staff = models.BooleanField(default=False) # a admin user; non super-user
    admin = models.BooleanField(default=False) # a superuser
    # notice the absence of a "Password field", that's built in.

    updated = models.DateTimeField(auto_now=True, auto_now_add=False)
    timestamp = models.DateTimeField(auto_now=False, auto_now_add=True)

    USERNAME_FIELD = 'user_name'
    REQUIRED_FIELDS = [] # Email & Password are required by default.

    objects = UserManager()
    user_in_group = OrganUserManager()

    def __str__(self):              # __unicode__ on Python 2
        return self.user_name

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        return self.staff

    @property
    def is_admin(self):
        "Is the user a admin member?"
        return self.admin

    @property
    def permissiontree(self):

        # role = MyRoles.objects.get(name=self.Role)
        try:

            tree = json.loads(self.Role.permissionTree)
            tree_str = [t['id'] for t in tree]
            # return ','.join(tree_str)
            return tree_str
        except:
            return []

    def has_menu_permission(self,perm):
        if self.is_admin:
            return True
        if self.Role is None:
            return False
        if self.Role.name == "超级管理员":
            return True
        permissiontree = self.Role.permissionTree

        ptree = json.loads(permissiontree)
        pt_dict = {}
        for pt in ptree:
            pt_dict[pt["id"]] = pt["edit"]

        if perm in pt_dict.keys():
            return True
        return False

    def has_menu_permission_edit(self,perm):
        if self.is_admin:
            return True
        if self.Role is None:
            return False
        if self.Role.name == "超级管理员":
            return True
        permissiontree = self.Role.permissionTree

        ptree = json.loads(permissiontree)
        pt_dict = {}
        for pt in ptree:
            pt_dict[pt["id"]] = pt["edit"]

        if perm in pt_dict.keys() and pt_dict[perm] == True:
            return True
        return False

    #组织及下属组织下的所有用户
    def user_list_queryset(self):
        # userlist = []
        if self.is_admin:
            return User.objects.all()

        user_self = User.objects.filter(user_name=self.user_name)
        userlist = user_self
        #下级组织的用户
        sub_organs = self.belongto.sub_organizations(include_self=False)
        # user | merge two QuerySet
        for g in sub_organs:
            userlist |= g.users.all()
            
        return userlist

    # 返回用户可分配的角色列表
    def role_list(self):
        rolelist = []
        if self.is_admin:
            return MyRoles.objects.all()

        # 自己被分配的角色
        role_self = self.Role
        rolelist.append(role_self)
        
        # 该用户创建的角色
        if MyRoles.objects.filter(uid=self.uuid).exists():
            # Force evaluation of a QuerySet by calling list() on it
            created_by_user = list(MyRoles.objects.filter(uid=self.uuid) )
            
            if created_by_user:
                
                rolelist += created_by_user
                
        #下级组织的角色 和 下级组织的用户的角色
        sub_organs = self.belongto.sub_organizations(include_self=False)
        for g in sub_organs:
            for r in g.roles.all():
                if r and r not in rolelist:
                    rolelist.append(r)
                    
            for u in g.users.all():
                if u.Role and u.Role not in rolelist:
                    rolelist.append(u.Role)
                    
        # print('ret rolelist:',rolelist)
        return rolelist

    # 组织下用户Login 记录
    def logrecord_list_queryset(self,q,stime,etime):
        loglist = LoginRecord.objects.none()
        #下级组织的用户
        sub_organs = self.belongto.sub_organizations(include_self=True)
        # user | merge two QuerySet
        for g in sub_organs:
            loglist |= g.loginrecord_set.search(q,stime,etime)
            
        return loglist




class LoginRecordQuerySet(models.query.QuerySet):
    def search(self, query,stime,etime):
        return self.filter(
                Q(user__user_name__icontains=query) &
                Q(signin_time__range=[stime,etime])
                # Q(meter__simid__simcardNumber__iexact=query)
                ).distinct()
        


class LoginRecordManager(models.Manager):
    def get_queryset(self):
        return LoginRecordQuerySet(self.model, using=self._db)

    def search(self, query,stime,etime): #RestaurantLocation.objects.search()
        return self.get_queryset().search(query,stime,etime)

class LoginRecord(models.Model):
    user        = models.ForeignKey(User,on_delete=models.CASCADE)       
    belongto    = models.ForeignKey(Organization,on_delete=models.CASCADE)     
    # create_date         = models.DateTimeField(db_column='create_date', auto_now_add=True)  # Field name made lowercase.
    signin_time = models.DateTimeField(db_column='signin time', auto_now=True)  # Field name made lowercase.
    ip          = models.CharField(max_length=32,blank=True,null=True)
    user_agent  = models.CharField(max_length=256,blank=True,null=True)
    log_from    = models.CharField(max_length=256,blank=True,null=True)
    description = models.TextField(blank=True)
    
    objects     = LoginRecordManager()

    class Meta:
        managed = True
        db_table = 'bsc_loginrecord'





def user_login_record(sender, user, request, **kwargs):
    print('sender',sender)
    print('user',user,type(user),user.belongto,type(user.belongto))
    # print('request',request.META)
    print('**kwargs',kwargs)
    
    user_agent = request.META['HTTP_USER_AGENT']

    if 'HTTP_X_FORWARDED_FOR' in request.META:
        ip =  request.META['HTTP_X_FORWARDED_FOR']
    else:
        ip = request.META['REMOTE_ADDR']
    
    print("user:{} ip:{} \nuser_agent:{}".format(user,ip,user_agent))

    record = {
        "user":user,
        "belongto":user.belongto,
        "ip":ip,
        "user_agent" : user_agent,
        "description":"用户 {} 登录".format(user.user_name),
        "log_from":"平台操作"
    }

    if user.user_name not in [ 'pwl','pwl2']:
        LoginRecord.objects.create(**record)

user_logged_in.connect(user_login_record)        
    




def pre_save_role_receiver(sender, instance, *args, **kwargs):
    if not instance.rid:
        instance.rid = unique_rid_generator(instance)

    # if instance.content:
    #     html_string = instance.get_markdown()
    #     read_time_var = get_read_time(html_string)
    #     instance.read_time = read_time_var


pre_save.connect(pre_save_role_receiver, sender=MyRoles)


