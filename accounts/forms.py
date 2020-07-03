# -*- coding:utf-8 -*-
from django import forms
from django.contrib.auth import authenticate, login, get_user_model
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import User,MyRoles

# User = get_user_model() #another way get user model

# class RegisterForm(forms.ModelForm):
#     password = forms.CharField(widget=forms.PasswordInput)
#     password2 = forms.CharField(label='Confirm password', widget=forms.PasswordInput)

#     class Meta:
#         model = User
#         fields = ('email',)

#     def clean_email(self):
#         email = self.cleaned_data.get('email')
#         qs = User.objects.filter(email=email)
#         if qs.exists():
#             raise forms.ValidationError("email is taken")
#         return email

#     def clean_password2(self):
#         # Check that the two password entries match
#         password1 = self.cleaned_data.get("password1")
#         password2 = self.cleaned_data.get("password2")
#         if password1 and password2 and password1 != password2:
#             raise forms.ValidationError("Passwords don't match")
#         return password2


class UserAdminCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('user_name','belongto','Role','is_active','expire_date','real_name','sex','phone_number','email','idstr','uuid')

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super(UserAdminCreationForm, self).save(commit=False)
        print("admin crate user password:",self.cleaned_data["password1"])
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserAdminChangeForm(forms.ModelForm):
    """A form for updating users. Includes all the fields on
    the user, but replaces the password field with admin's
    password hash display field.
    """
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = ('user_name','belongto','Role','is_active','expire_date','real_name','sex','phone_number','email','idstr','uuid')

    def clean_password(self):
        # Regardless of what the user provides, return the initial value.
        # This is done here, rather than on the field, because the
        # field does not have access to the initial value
        return self.initial["password"]



class LoginForm(forms.Form):
    user_name    = forms.CharField(label='user name')
    password     = forms.CharField(widget=forms.PasswordInput)
    captchaCode  = forms.CharField(widget = forms.HiddenInput(),required=False)

    def __init__(self, request, *args, **kwargs):
        self.request = request
        super(LoginForm, self).__init__(*args, **kwargs)

    # def clean_captchaCode(self):
    #     captchaCode = self.cleaned_data.get('captchaCode')
    #     if len(captchaCode) == 0:
    #         print '请把滑块滑到右边'
    #         raise forms.ValidationError("请把滑块滑到右边")
    #     return captchaCode

    def clean(self):
        request = self.request
        data = self.cleaned_data
        user_name  = data.get("user_name")
        password  = data.get("password")
        # print('request:',user_name,password)
        captchaCode = data.get('captchaCode') or ''
        if len(captchaCode) == 0:
            print( '请把滑块滑到右边')
            # raise forms.ValidationError("请把滑块滑到右边")

        qs = User.objects.filter(user_name=user_name)
        if qs.exists():
            # user email is registered, check active/
            not_active = qs.filter(is_active=False)
            if not_active.exists():
                raise forms.ValidationError("This user is inactive.")
                ## not active, check email activation
                # link = reverse("account:resend-activation")
                # reconfirm_msg = """Go to <a href='{resend_link}'>
                # resend confirmation email</a>.
                # """.format(resend_link = link)
                # confirm_email = EmailActivation.objects.filter(email=email)
                # is_confirmable = confirm_email.confirmable().exists()
                # if is_confirmable:
                #     msg1 = "Please check your email to confirm your account or " + reconfirm_msg.lower()
                #     raise forms.ValidationError(mark_safe(msg1))
                # email_confirm_exists = EmailActivation.objects.email_exists(email).exists()
                # if email_confirm_exists:
                #     msg2 = "Email not confirmed. " + reconfirm_msg
                #     raise forms.ValidationError(mark_safe(msg2))
                # if not is_confirmable and not email_confirm_exists:
                #     raise forms.ValidationError("This user is inactive.")
        user = authenticate(request, username=user_name, password=password)
        if user is None:
            print("invalid user")
            raise forms.ValidationError("用户名或密码错误")
        login(request, user)
        self.user = user
        return data   

class RegisterForm(forms.ModelForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    belongto  = forms.CharField()

    class Meta:
        model = User
        fields = ('user_name','password1','is_active','expire_date','real_name','sex','phone_number','email','idstr','uuid')

    def __init__(self,instance,*args,**kwargs):
        super(RegisterForm, self).__init__(*args, **kwargs)

        # self.fields['sex'].widget = forms.RadioSelect(choices=SEX)
        # self.fields['sex'].widget.choices = SEX

    # def clean_password2(self):
    #     # Check that the two password entries match
    #     password1 = self.cleaned_data.get("password1")
    #     password2 = self.cleaned_data.get("password2")
    #     if password1 and password2 and password1 != password2:
    #         raise forms.ValidationError("Passwords don't match")
    #     return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        print('account register form save?')
        user = super(RegisterForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        user.active = False #send confirm email
        if commit:
            user.save()
        return user


class UserDetailChangeForm(forms.ModelForm):
    password = forms.CharField(required = False)
    belongto  = forms.CharField()

    
    class Meta:
        model = User
        fields = ['user_name','is_active','expire_date','real_name','sex','phone_number','email','idstr','uuid']

    def __init__(self,*args,**kwargs):
        super(UserDetailChangeForm, self).__init__(*args, **kwargs)

        # self.fields['password'].widget = forms.PasswordInput()
        self.fields['belongto'].initial = self.instance.belongto.name
        # self.fields['sex'].widget = forms.RadioSelect(choices=SEX)

    # def clean_password(self):
    #     print('clean_password::')
    #     password = self.cleaned_data.get('password')
    #     if len(password) == 0:
    #         raise forms.ValidationError("密码不能为空")
    #     return password


    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super(UserDetailChangeForm, self).save(commit=False)
        password = self.cleaned_data["password"]
        print('user password:',password)
        if password != '':
            user.set_password(password)

        # is_active = self.cleaned_data["is_active"]
        # print('is_active:',is_active)
        # user.active = is_active #send confirm email
        if commit:
            user.save()
        return user

# class RegisterForm(forms.Form):
#     username = forms.CharField()
#     email = forms.EmailField()
#     password = forms.CharField(widget=forms.PasswordInput)
#     password2 = forms.CharField(widget=forms.PasswordInput)

    # def clean_username(self):
    #     username = self.cleaned_data.get('username')
    #     qs = User.objects.filter(username=username)
    #     if qs.exists():
    #         raise forms.ValidationError("Username is taken")
    #     return username

    # def clean_email(self):
    #     email = self.cleaned_data.get('email')
    #     qs = User.objects.filter(email=email)
    #     if qs.exists():
    #         raise forms.ValidationError("email is taken")
    #     return email

    # def clean(self):
    #     data = self.cleaned_data
    #     password = self.cleaned_data.get('password')
    #     password2 = self.cleaned_data.get('password2')
    #     if password != password2:
    #         raise forms.ValidationError("Passwords must match.")
    #     return data
    #     


"""
Stations creation, manager
"""
class RoleCreateForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(RoleCreateForm, self).__init__(*args, **kwargs)
        

    class Meta:
        model = MyRoles
        fields= ('name','notes','permissionTree')    



class MyRolesForm(forms.ModelForm):
    class Meta:
        model = MyRoles    
        fields= ('name','notes','permissionTree')    

    def __init__(self, *args, **kwargs):
        super(MyRolesForm, self).__init__(*args, **kwargs)