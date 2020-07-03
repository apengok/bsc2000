from django.utils.http import is_safe_url
from django.shortcuts import render,HttpResponse
import json
import unicodecsv

class RequestFormAttachMixin(object):
    def get_form_kwargs(self):
        kwargs = super(RequestFormAttachMixin, self).get_form_kwargs()
        kwargs['request'] = self.request
        return kwargs


class NextUrlMixin(object):
    default_next = "/"
    def get_next_url(self):
        request = self.request
        next_ = request.GET.get('next')
        next_post = request.POST.get('next')
        redirect_path = next_ or next_post or None
        if is_safe_url(redirect_path, request.get_host()):
                return redirect_path
        return self.default_next


        
class AjaxableResponseMixin(object):
    """
    Mixin to add AJAX support to a form.
    Must be used with an object-based FormView (e.g. CreateView)
    """
    def form_invalid(self, form):
        response = super(AjaxableResponseMixin,self).form_invalid(form)
        # print("dasf:",form.cleaned_data.get("register_date"))
        err_str = ""
        for k,v in form.errors.items():
            print(k,v)
            err_str += v[0]
        if err_str == 'Group with this Name already exists.':
            err_str = '角色名已存在'
        if self.request.is_ajax():
            data = {
                "success": 0,
                "obj":{
                    "flag":0,
                    "errMsg":err_str
                    }
            }
            print(form.errors)
            return HttpResponse(json.dumps(data)) #JsonResponse(data)
            # return JsonResponse(form.errors, status=400)
        else:
            return response

    def form_valid(self, form):
        # We make sure to call the parent"s form_valid() method because
        # it might do some processing (in the case of CreateView, it will
        # call form.save() for example).
        response = super(AjaxableResponseMixin,self).form_valid(form)
        if self.request.is_ajax():
            data = {
                "success": 1,
                "obj":{"flag":1}
            }
            return HttpResponse(json.dumps(data)) #JsonResponse(data)
        else:
            return response
        


class ExportCsvMixin:
    def export_as_csv(self, request, queryset):

        meta = self.model._meta
        field_names = [field.name for field in meta.fields]

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta)
        writer = unicodecsv.writer(response,encoding='utf-8')

        writer.writerow(field_names)
        for obj in queryset:
            row = writer.writerow([getattr(obj, field) for field in field_names])

        return response

    export_as_csv.short_description = "Export Selected"
