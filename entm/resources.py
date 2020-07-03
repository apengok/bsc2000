# -*- coding:utf-8 -*-
from import_export import resources,fields
from accounts.models import User,MyRoles
from core.models import Organization
from bsc2000.middleware import get_current_user
import datetime 
from entm import constant




#https://stackoverflow.com/questions/1108428/how-do-i-read-a-date-in-excel-format-in-python
def minimalist_xldate_as_datetime(xldate, datemode):
# datemode: 0 for 1900-based, 1 for 1904-based
    return (
        datetime.datetime(1899, 12, 30)
        + datetime.timedelta(days=xldate + 1462 * datemode)
        )


class UserResource(resources.ModelResource):
    user_name    = fields.Field(column_name=u'用户名', attribute="user_name")
    real_name    = fields.Field(column_name=u'真实姓名', attribute="real_name")
    sex          = fields.Field(column_name=u'性别', attribute="sex")
    phone_number = fields.Field(column_name=u'手机', attribute="phone_number")
    email        = fields.Field(column_name=u'邮箱', attribute="email")
    is_active    = fields.Field(column_name=u'启停状态', attribute="is_active")
    expire_date  = fields.Field(column_name=u'授权截止日期', attribute="expire_date")
    belongto     = fields.Field(column_name=u'所属组织', attribute="belongto")
    Role         = fields.Field(column_name=u'角色', attribute="Role")
    


    class Meta:
        model = User
        import_id_fields = ['user_name']
        fields = ('user_name', 'real_name', 'sex','phone_number','email','is_active','expire_date','belongto','Role')
        # exclude = ('idstr')
        export_order = fields


    def dehydrate_sex(self,user):
        # print('dehydrate_sex:',user.sex)
        # #export
        # if user.sex == '1':
        #     return '男'
        # if user.sex == '2':
        #     return '女'

        # #import
        # if user.sex == '男':
        #     return '1'
        # if user.sex == '女':
        #     return '2'
        return '男' if user.sex == '1' else '女'

    def dehydrate_is_active(self,user):
        # print('dehydrate_is_active:',user.is_active)
        #export
        
        return '启用' if user.is_active else '停用'

    def dehydrate_belongto(self,user):
        # print('dehydrate_belongto',user.belongto)
        if user.belongto:
            return user.belongto.name
        else:
            # raise Exception(" belongto is none ")
            return ''

    def dehydrate_Role(self,user):
        # print('dehydrate_Role',user.Role)
        if user.Role:
            return user.Role.name
        else:
            return ''



class ImportUserResource(resources.ModelResource):
    user_name    = fields.Field(column_name=u'用户名', attribute="user_name")
    real_name    = fields.Field(column_name=u'真实姓名', attribute="real_name")
    sex          = fields.Field(column_name=u'性别', attribute="sex")
    phone_number = fields.Field(column_name=u'手机', attribute="phone_number")
    email        = fields.Field(column_name=u'邮箱', attribute="email")
    is_active    = fields.Field(column_name=u'启停状态', attribute="is_active")
    expire_date  = fields.Field(column_name=u'授权截止日期', attribute="expire_date")
    belongto     = fields.Field(column_name=u'所属组织', attribute="belongto")
    Role         = fields.Field(column_name=u'角色', attribute="Role")
    password    = fields.Field(column_name=u'密码', attribute="password")



    class Meta:
        model = User
        import_id_fields = ['user_name']
        fields = ('user_name', 'real_name', 'sex','phone_number','email','is_active','expire_date','belongto','Role')
        # exclude = ('idstr')
        export_order = fields

    

    def before_import_row(self, row, **kwargs):
        
        user = kwargs["user"]
        user_expiredate = user.expire_date

        username = str(row[u'用户名'])
        
        # 从excel读上来的数据全是数字都是float类型
        if '.' in username:
            if isinstance(row[u'用户名'],float):
                username = str(int(row[u'用户名']))
                row[u'用户名'] = username

        password = row[u'密码']
        try:
            if isinstance(password,float):
                password = str(int(password))
                row[u'密码'] = password
                # print(password,type(password))
        except:
            pass


        
        
        # Excel save date as float
        authorizationDate = row[u'授权截止日期']
        if authorizationDate == '':
            row[u'授权截止日期'] = user_expiredate
        else:
            if isinstance(authorizationDate,str):
                b = datetime.datetime.strptime(authorizationDate.strip(),"%Y-%m-%d")
            else:
                authorizationDate = int(row[u'授权截止日期'])
                b = minimalist_xldate_as_datetime(authorizationDate,0)
                row[u'授权截止日期'] = b.strftime('%Y-%m-%d')

    

        phone_number = str(row[u'手机'])
        if '.' in phone_number:
            if isinstance(row[u'手机'],float):
                phone_number = str(int(row[u'手机']))
                row[u'手机'] = phone_number

        gender = row[u'性别']
        if gender == u'男':
            row[u'性别'] = 1
        elif gender == u'女':
            row[u'性别'] = 2
        else:
            row[u'性别'] = 1
        

        state = row[u'启停状态']
        if state == u'启用':
            row[u'启停状态'] = True
        elif state == u'停用':
            row[u'启停状态'] = False
        else:
            row[u'启停状态'] = True
        

        org_name = row[u'所属组织']
        org = Organization.objects.filter(name=org_name)
        
        if org.exists():
            row[u'所属组织'] = org[0]
        else:
            row[u'所属组织'] = None
            

        role_name = row[u'角色']
        role = MyRoles.objects.filter(name=role_name)
        
        if role.exists():
            row[u'角色'] = role[0]
        else:
            row[u'角色'] = None
            

        super(ImportUserResource,self).before_import_row(row,**kwargs)
        
        if 'imported_num' in cache:
            cache.incr('imported_num')





    # def import_obj(self,instance, row,dry_run,**kwargs):
        
    #     user = get_current_user()
    #     print('current_user:',user)
    #     print (kwargs)
    #     for k in row:
    #         print(k,row[k],type(row[k]))

    #     username = str(row[u'用户名'])
    #     print('username:',username)
    #     # 从excel读上来的数据全是数字都是float类型
    #     if '.' in username:
    #         if isinstance(row[u'用户名'],float):
    #             username = str(int(row[u'用户名']))
    #             row[u'用户名'] = username

    #     bflag = User.objects.filter(user_name=username).exists()
    #     if bflag:
    #         raise Exception(u"用户%s已存在"%(username))


    #     authorizationDate = row[u'授权截止日期']
    #     user_expiredate = user.expire_date
        
    #     a = datetime.strptime(user_expiredate,"%Y-%m-%d")
    #     b = datetime.strptime(authorizationDate.strip(),"%Y-%m-%d")
    #     bflag = b <= a
    #     if bflag:
    #         raise Exception(u"用户授权截止日期%s大于当前用户的截止日期"%(authorizationDate,user_expiredate))

    #     phone_number = str(row[u'手机'])
    #     if '.' in phone_number:
    #         if isinstance(row[u'手机'],float):
    #             phone_number = str(int(row[u'手机']))
    #             row[u'手机'] = phone_number

    #     gender = row[u'性别']
    #     if gender == u'男':
    #         row[u'性别'] = 1
    #     elif gender == u'女':
    #         row[u'性别'] = 2
    #     else:
    #         raise Exception(u"请输入正确的性别")

    #     state = row[u'启停状态']
    #     if state == u'启用':
    #         row[u'启停状态'] = True
    #     elif state == u'停用':
    #         row[u'启停状态'] = False
    #     else:
    #         raise Exception(u"请输入正确的启停状态")

    #     org_name = row[u'所属组织']
    #     org = Organization.objects.filter(name=org_name)
    #     print('org:',org)
    #     if org.exists():
    #         row[u'所属组织'] = org[0]
    #     else:
    #         row[u'所属组织'] = org[0]
    #         raise Exception(u"该组织%s不存在"%(org_name))

    #     role_name = row[u'角色']
    #     role = MyRoles.objects.filter(name=role_name)
    #     print('role:',role)
    #     if role.exists():
    #         row[u'角色'] = role[0]
    #     else:
    #         row[u'角色'] = None
    #         # raise Exception(u"该角色%s不存在"%(role_name))


    #     super(UserResource, self).import_obj(instance, row,dry_run)

        # instance.name = "%s %s" % (row['Name'], row['Surname'])
        # if row['Slv/Gld'] == 'Sil':
        #     instance.level = 1
            # and so on

    # @classmethod
    # def field_from_django_field(self, field_name, django_field, readonly):
    #     """
    #     Returns a Resource Field instance for the given Django model field.
    #     reference from https://github.com/django-import-export/django-import-export/issues/230
    #     """
    #     FieldWidget = self.widget_from_django_field(django_field)
    #     widget_kwargs = self.widget_kwargs_for_field(field_name)
    #     field = fields.Field(attribute=field_name, column_name=django_field.verbose_name,
    #             widget=FieldWidget(**widget_kwargs), readonly=readonly)
    #     return field

    # def before_import(self, dataset, using_transactions, dry_run, **kwargs):
    #     print('before_import:',dataset.dict)

    # def before_import(self, dataset, dry_run):
    #     """
    #     Make standard corrections to the dataset
    #     """

    #     # Convert headers to lower case
    #     if dataset.headers:
    #         dataset.headers = [str(header).lower().strip() for header in dataset.headers]

    #     # Skip rows before the table headers
    #     while not dataset.headers or not (set(dataset.headers) & set(self.fields.keys())):
    #         dataset.headers = [str(item).lower() for item in dataset[0]]
    #         del dataset[0]
    #         logger.warning('Deleting non-header line from start of Dataset')

    #     if 'id' not in dataset.headers and 'other_col' in dataset.headers:
    #         dataset.headers[dataset.headers.index('other_col')] = 'id'  # Rename a column
    #     if 'id' not in dataset.headers:
    #         dataset.insert_col(0, lambda row: dict(zip(dataset.headers, row))['accno'] * 10, header='id')  # or use a lambda to calculate the id


