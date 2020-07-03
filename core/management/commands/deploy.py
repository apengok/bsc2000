# -*- coding:utf-8 -*-
from django.core.management.base import BaseCommand, CommandError


import time
import datetime
import logging
import string
import itertools
from accounts.models import MyRoles,User
from core.models import Organization
from core.menus import buildbasetree
import json


logger_info = logging.getLogger('info_logger')


def random_string_generator(size=10, chars=string.ascii_lowercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))


"""
When you call values() on a queryset where the Model has a ManyToManyField
and there are multiple related items, it returns a separate dictionary for each
related item. This function merges the dictionaries so that there is only
one dictionary per id at the end, with lists of related items for each.
"""
def merge_values(values):
    grouped_results = itertools.groupby(values, key=lambda value: value['id'])
    print(grouped_results)
    merged_values = []
    for k, g in grouped_results:
        print( k)
        groups = list(g)
        merged_value = {}
        for group in groups:
            for key, val in group.items():
                if not merged_value.get(key):
                    merged_value[key] = val
                elif val != merged_value[key]:
                    if isinstance(merged_value[key], list):
                        if val not in merged_value[key]:
                            merged_value[key].append(val)
                    else:
                        old_val = merged_value[key]
                        merged_value[key] = [old_val, val]
        merged_values.append(merged_value)
    return merged_values

class Command(BaseCommand):
    help = 'deloy project by intializer related data.'

    def add_arguments(self, parser):
        # parser.add_argument('sTime', type=str)

        

        parser.add_argument(
            '--initializer',
            action='store_true',
            dest='initializer',
            default=False,
            help='initializer Organization and super Role'
        )




    def handle(self, *args, **options):
        # sTime = options['sTime']
        t1=time.time()
        count = 0
        aft = 0

        

        if options['initializer']:
            # organization
            organ = {
                'name':'威尔沃',
                'pId':'organization',
                'cid':'virvo_organization',
                'is_org':True,
                'attribute':'非自来水公司',
                'register_date':'2018-06-01',
                'owner_name':'申应统',
                'uuid':'virvo_super'
            }
            try:
                organ_obj = Organization.objects.first()
                if not organ_obj:
                    Organization.objects.create(**organ)
            except Exception as e:
                print('failed to create Organization Virvo.:',e)
                return

            count += 1
            # super Role
            virvo = Organization.objects.first()

            ctree = json.dumps(buildbasetree())
            role = {
                'name':'超级管理员',
                'permissionTree':ctree,
                'belongto':virvo,
                'uid':'virvo_super'

            }
            try:
                role_obj = MyRoles.objects.first()
                if not role_obj:
                    MyRoles.objects.create(**role)
                else:
                    role_obj.permissionTree = ctree
                    role_obj.belongto = virvo
                    role_obj.save()
            except:
                print("failed to create super role .")
                return
            count += 1

            # super user
            try:
                super_role = MyRoles.objects.first()
                super_user = {
                    'user_name':'admin',
                    'is_active':True,
                    'staff':True,
                    'admin':True,
                    'belongto':virvo,
                    'Role':super_role,
                    'uuid':'virvo_super'
                }
                user_obj = User.objects.first()
                if not user_obj:
                    user = User.objects.create(**super_user)
                    user.set_password('123456')
                    user.save()
                else:

                    user_obj.Role = super_role
                    user_obj.belongto = virvo
                    user_obj.save()
            except:
                print("failed to set user role and belongto.")
                return
            count+=1
            
            
                
        
        # print('cnt=',cnt,cnt2)
        t2 = time.time() - t1
        self.stdout.write(self.style.SUCCESS(f'total {count}  Affected {aft} row(s)!,elapsed {t2}'))
