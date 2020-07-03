from django.shortcuts import render,redirect
from django.views.generic import CreateView,DetailView,UpdateView,FormView
from django.contrib.auth import authenticate,login,get_user_model
from .forms import LoginForm,RegisterForm ,UserDetailChangeForm  #,GuestForm
from core.mixins import NextUrlMixin, RequestFormAttachMixin
from core.models import Personalized

# Create your views here.


class LoginView(NextUrlMixin, RequestFormAttachMixin, FormView):
    form_class = LoginForm
    success_url = '/home/'
    template_name = 'index.html'
    default_next = '/home/'

    def form_valid(self, form):

        next_path = self.get_next_url()
        if next_path is not None:
            return redirect(to=next_path)
            
        user = self.request.user
        p = Personalized.objects.filter(belongto=user.belongto) #.filter(ptype="custom")

        if p.exists():
            next_path = p.first().frontPageMsgUrl
            
            if next_path is None or len(next_path) == 0:
                next_path = self.get_next_url()
        else:
            next_path = self.get_next_url()

        return redirect(to=next_path)
        # return render(self.request,next_path,{})

    