from rest_framework.pagination import (
    LimitOffsetPagination,
    PageNumberPagination,
)
from rest_framework.response import Response



class PostLimitOffsetPagination(LimitOffsetPagination):
    default_limit = 10
    max_limit = 10
    page_size_query_param = 'length'


class DataTablePageNumberPagination(PageNumberPagination):
    # page_size = 20
    # page_query_param = 'draw'
    page_size_query_param = 'length'

    def get_paginated_response(self, data):
        draw = int(self.request.GET.get("draw", 1))
        length = int(self.request.GET.get("length", 10))
        start = int(self.request.GET.get("start", 0))

        record_count = self.page.paginator.count
        
        return Response({
            # 'links': {
            #     'next': self.get_next_link(),
            #     'previous': self.get_previous_link()
            # },
            "draw":draw,
            "success":"true",
            "start":start,
            "totalPages":record_count/length,
            'recordsTotal': record_count,
            "recordsFiltered":record_count,
            'records': data,
        })
    