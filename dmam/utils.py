# -*- coding: utf-8 -*-

import itertools


"""
When you call values() on a queryset where the Model has a ManyToManyField
and there are multiple related items, it returns a separate dictionary for each
related item. This function merges the dictionaries so that there is only
one dictionary per id at the end, with lists of related items for each.
"""
def merge_values(values):
    grouped_results = itertools.groupby(values, key=lambda value: value['id'])
    
    merged_values = []
    for k, g in grouped_results:
        
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


def merge_values_with(values,tag):
    grouped_results = itertools.groupby(values, key=lambda value: value[tag])
    # print('grouped_results,',grouped_results)
    merged_values = []
    for k, g in grouped_results:
        groups = list(g)
        # print(k,groups)
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


def merge_values_to_dict(values,tag):
    grouped_results = itertools.groupby(values, key=lambda value: value[tag])
    # print('grouped_results,',grouped_results)
    merged_values = {}
    
    for k, g in grouped_results:
        groups = list(g)
        # print(k,groups)
        merged_values[k] = groups[0]
        
        
    return merged_values