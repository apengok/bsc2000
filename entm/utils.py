# -*- coding:utf-8 -*-

import random
import string

from django.utils.text import slugify
'''
random_string_generator is located here:
http://joincfe.com/blog/random-string-generator-in-python/
'''

DONT_USE = ['create']
def random_string_generator(size=10, chars=string.ascii_lowercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))


# generate organization cid not user
def unique_cid_generator(instance, new_cid=None):
    """
    This is for a Django project and it assumes your instance 
    has a model with a slug field and a title character (char) field.
    """
    if new_cid is not None:
        cid = new_cid
    else:
        cid = "{cid}_{randstr}".format(
                    cid=random_string_generator(size=4),
                    randstr=random_string_generator(size=4)
                )
        
    Klass = instance.__class__
    qs_exists = Klass.objects.filter(cid=cid).exists()
    if qs_exists:
        new_cid = "{cid}_{randstr}".format(
                    cid=cid,
                    randstr=random_string_generator(size=4)
                )
        return unique_cid_generator(instance, new_cid=new_cid)
    return cid


def unique_rid_generator(instance, new_rid=None):
    """
    This is for a Django project and it assumes your instance 
    has a model with a slug field and a title character (char) field.
    """
    if new_rid is not None:
        rid = new_rid
    else:
        rid = "ROLE_{randstr}_{randstr2}".format(
                    randstr=random_string_generator(size=6),
                    randstr2=random_string_generator(size=4)
                )
        
    Klass = instance.__class__
    qs_exists = Klass.objects.filter(rid=rid).exists()
    if qs_exists:
        new_rid = "{randstr}_{randstr2}".format(
                    randstr=random_string_generator(size=6),
                    randstr2=random_string_generator(size=4)
                )
        return unique_rid_generator(instance, new_rid=new_rid)
    return rid


def unique_uuid_generator(instance, new_uuid=None):
    """
    This is for a Django project and it assumes your instance 
    has a model with a slug field and a title character (char) field.
    """
    if new_uuid is not None:
        uuid = new_uuid
    else:
        uuid = "{rand1}_{randstr}".format(
                    rand1=random_string_generator(size=6),
                    randstr=random_string_generator(size=4)
                )
    # if uuid in DONT_USE:
    #     new_uuid = "{uuid}_{randstr}".format(
    #                 uuid=uuid,
    #                 randstr=random_string_generator(size=4)
    #             )
    #     return unique_uuid_generator(instance, new_uuid=new_uuid)
    Klass = instance.__class__
    qs_exists = Klass.objects.filter(uuid=uuid).exists()
    if qs_exists:
        new_uuid = "{rand1}_{randstr}".format(
                    rand1=random_string_generator(size=6),
                    randstr=random_string_generator(size=4)
                )
        return unique_uuid_generator(instance, new_uuid=new_uuid)
    return uuid

def unique_slug_generator(instance, new_slug=None):
    """
    This is for a Django project and it assumes your instance 
    has a model with a slug field and a title character (char) field.
    """
    if new_slug is not None:
        slug = new_slug
    else:
        slug = slugify(instance.title)
    if slug in DONT_USE:
        new_slug = "{slug}-{randstr}".format(
                    slug=slug,
                    randstr=random_string_generator(size=4)
                )
        return unique_slug_generator(instance, new_slug=new_slug)
    Klass = instance.__class__
    qs_exists = Klass.objects.filter(slug=slug).exists()
    if qs_exists:
        new_slug = "{slug}-{randstr}".format(
                    slug=slug,
                    randstr=random_string_generator(size=4)
                )
        return unique_slug_generator(instance, new_slug=new_slug)
    return slug


def unique_shapeid_generator(instance, new_polygonId=None):
    """
    This is for a Django project and it assumes your instance 
    has a model with a slug field and a title character (char) field.
    """
    if new_polygonId is not None:
        polygonId = new_polygonId
    else:
        polygonId = "{polygonId}_{randstr}".format(
                    polygonId=random_string_generator(size=4),
                    randstr=random_string_generator(size=4)
                )
        
    Klass = instance.__class__
    qs_exists = Klass.objects.filter(polygonId=polygonId).exists()
    if qs_exists:
        new_polygonId = "{polygonId}_{randstr}".format(
                    polygonId=polygonId,
                    randstr=random_string_generator(size=4)
                )
        return unique_shapeid_generator(instance, new_polygonId=new_polygonId)
    return polygonId