# -*- coding: utf-8 -*-

import math
from math import sqrt,sin,cos,tan
import json



key = 'your key here'  # 这里填写你的百度开放平台的key
x_pi = 3.14159265358979324 * 3000.0 / 180.0
pi = 3.1415926535897932384626  # π
a = 6378245.0  # 长半轴
ee = 0.00669342162296594323  # 扁率


def geocode(address):
    """
    利用百度geocoding服务解析地址获取位置坐标
    :param address:需要解析的地址
    :return:
    """
    geocoding = {'s': 'rsv3',
                 'key': key,
                 'city': '全国',
                 'address': address}
    res = requests.get(
        "http://restapi.amap.com/v3/geocode/geo", params=geocoding)
    if res.status_code == 200:
        json = res.json()
        status = json.get('status')
        count = json.get('count')
        if status == '1' and int(count) >= 1:
            geocodes = json.get('geocodes')[0]
            lng = float(geocodes.get('location').split(',')[0])
            lat = float(geocodes.get('location').split(',')[1])
            return [lng, lat]
        else:
            return None
    else:
        return None


def gcj02tobd09(lng, lat):
    """
    火星坐标系(GCJ-02)转百度坐标系(BD-09)
    谷歌、高德——>百度
    :param lng:火星坐标经度
    :param lat:火星坐标纬度
    :return:
    """
    z = math.sqrt(lng * lng + lat * lat) + 0.00002 * math.sin(lat * x_pi)
    theta = math.atan2(lat, lng) + 0.000003 * math.cos(lng * x_pi)
    bd_lng = z * math.cos(theta) + 0.0065
    bd_lat = z * math.sin(theta) + 0.006
    return [bd_lng, bd_lat]


def bd09togcj02(bd_lon, bd_lat):
    """
    百度坐标系(BD-09)转火星坐标系(GCJ-02)
    百度——>谷歌、高德
    :param bd_lat:百度坐标纬度
    :param bd_lon:百度坐标经度
    :return:转换后的坐标列表形式
    """
    x = bd_lon - 0.0065
    y = bd_lat - 0.006
    z = math.sqrt(x * x + y * y) - 0.00002 * math.sin(y * x_pi)
    theta = math.atan2(y, x) - 0.000003 * math.cos(x * x_pi)
    gg_lng = z * math.cos(theta)
    gg_lat = z * math.sin(theta)
    return [gg_lng, gg_lat]


def wgs84togcj02(lng, lat):
    """
    WGS84转GCJ02(火星坐标系)
    :param lng:WGS84坐标系的经度
    :param lat:WGS84坐标系的纬度
    :return:
    """
    if out_of_china(lng, lat):  # 判断是否在国内
        return lng, lat
    dlat = transformlat(lng - 105.0, lat - 35.0)
    dlng = transformlng(lng - 105.0, lat - 35.0)
    radlat = lat / 180.0 * pi
    magic = math.sin(radlat)
    magic = 1 - ee * magic * magic
    sqrtmagic = math.sqrt(magic)
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * pi)
    dlng = (dlng * 180.0) / (a / sqrtmagic * math.cos(radlat) * pi)
    mglat = lat + dlat
    mglng = lng + dlng
    return [mglng, mglat]


def gcj02towgs84(lng, lat):
    """
    GCJ02(火星坐标系)转GPS84
    :param lng:火星坐标系的经度
    :param lat:火星坐标系纬度
    :return:
    """
    # if out_of_china(lng, lat):
    #     return lng, lat
    dlat = transformlat(lng - 105.0, lat - 35.0)
    dlng = transformlng(lng - 105.0, lat - 35.0)
    radlat = lat / 180.0 * pi
    magic = math.sin(radlat)
    magic = 1 - ee * magic * magic
    sqrtmagic = math.sqrt(magic)
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * pi)
    dlng = (dlng * 180.0) / (a / sqrtmagic * math.cos(radlat) * pi)
    mglat = lat + dlat
    mglng = lng + dlng
    return [lng * 2 - mglng, lat * 2 - mglat]


def transformlat(lng, lat):
    ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + \
        0.1 * lng * lat + 0.2 * math.sqrt(math.fabs(lng))
    ret += (20.0 * math.sin(6.0 * lng * pi) + 20.0 *
            math.sin(2.0 * lng * pi)) * 2.0 / 3.0
    ret += (20.0 * math.sin(lat * pi) + 40.0 *
            math.sin(lat / 3.0 * pi)) * 2.0 / 3.0
    ret += (160.0 * math.sin(lat / 12.0 * pi) + 320 *
            math.sin(lat * pi / 30.0)) * 2.0 / 3.0
    return ret


def transformlng(lng, lat):
    ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + \
        0.1 * lng * lat + 0.1 * math.sqrt(math.fabs(lng))
    ret += (20.0 * math.sin(6.0 * lng * pi) + 20.0 *
            math.sin(2.0 * lng * pi)) * 2.0 / 3.0
    ret += (20.0 * math.sin(lng * pi) + 40.0 *
            math.sin(lng / 3.0 * pi)) * 2.0 / 3.0
    ret += (150.0 * math.sin(lng / 12.0 * pi) + 300.0 *
            math.sin(lng / 30.0 * pi)) * 2.0 / 3.0
    return ret

def lonLat2Mercator(x,y):
    x = x * 20037508.34 / 180
    y = math.log(math.tan((90 + y) * pi / 360)) / (pi / 180)
    y = y * 20037508.34 / 180

    return x,y


def Mercator2lonLat(x,y):
    x = x / 20037508.34 * 180
    y = y / 20037508.34 * 180

    y = 180 / pi * (2 * math.atan(math.exp(y * pi / 180)) - pi / 2)

    return x,y


def out_of_china(lng, lat):
    """
    判断是否在国内，不在国内不做偏移
    :param lng:
    :param lat:
    :return:
    """
    if lng < 72.004 or lng > 137.8347:
        return True
    if lat < 0.8293 or lat > 55.8271:
        return True
    return False

gProFN = 0. #南半球FN ＝ 1000000.
gProK0 = 1. #UTM投影中k0=0.9996


GRAPH_PI = 3.14159265358979323846264338327950288

# CordParam
Krasovsky,BeiJing1954,IAG75,XiAn1980,WGS84,CGCS2000 = 1,1,2,2,3,3
# ProjKind
ThreeProj,SixProj = 3,6

class GGaussCoordConvert:
    def __init__(self,cord, projKind,pWithProjNumber, pCentralMeridian, pConvType, pLocalX, pLocalY, pAngle, pFactor):

        if cord == BeiJing1954:
            self.m_a = 6378245.
            self.m_b = 6356863.0188
        elif cord == XiAn1980:
            self.m_a = 6378140.
            self.m_b = 6356755.2882
        elif cord == CGCS2000:
            self.m_a = 6378137.
            self.m_b = 6356752.3142

        self.m_f = (self.m_a - self.m_b)/self.m_a

        self.m_e1_2 = 1. - (self.m_b*self.m_b)/(self.m_a*self.m_a)
        self.m_e2_2 = (self.m_a*self.m_a)/(self.m_b*self.m_b) - 1.
        self.m_e1 = math.sqrt(self.m_e1_2)
        self.m_e2 = math.sqrt(self.m_e2_2)

        self.projKind = projKind

        self.m_WithProjNumber = pWithProjNumber
        self.m_CentralMeridian = pCentralMeridian

        self.m_ConvType = pConvType
        self.m_LocalX = pLocalX
        self.m_LocalY = pLocalY
        self.m_Angle = pAngle
        self.m_Factor = pFactor


    def convToGlobal(self, px,  py):

        pLa = 0
        pLo = 0
        D = py
        if self.m_WithProjNumber:
        
            m_curProjNumber = 0
            while D>1000000.:
            
                D -= 1000000.
                m_curProjNumber+=1
            
        

        tx1 = px
        ty1 = D
        if self.m_ConvType == 0:
        
            # 四参数变换。
            if self.m_Factor > 0:
            
                tx1 = (tx1 - self.m_LocalX) / self.m_Factor
                ty1 = (ty1 - self.m_LocalY) / self.m_Factor

                tx1,ty1 = self.rotate(tx1, ty1, 0, 0, - self.m_Angle)
                D = ty1
            
        

        m_dblY0 = 500000.
        D -= m_dblY0

        Mf = (tx1 - gProFN)/gProK0
        Fai = Mf/(self.m_a*(1.-self.m_e1_2/4.-3.*self.m_e1_2*self.m_e1_2/64.-5.*self.m_e1_2*self.m_e1_2*self.m_e1_2/256.)) 

        e1 = (self.m_a-self.m_b)/(self.m_a+self.m_b)
        
        Bf = Fai+(3.*e1/2.-27.*e1*e1*e1/32.)*sin(2.*Fai)+(21.*e1*e1/16.-55.*e1*e1*e1*e1/32.)*sin(4.*Fai)+(151.*e1*e1*e1/96.)*sin(6.*Fai)
        
        Nf = self.m_a/math.sqrt(1.-self.m_e1_2*math.sin(Bf)*math.sin(Bf))
        D/=(gProK0*Nf)

        Tf = math.tan(Bf)*math.tan(Bf)
        Cf = self.m_e2_2*math.cos(Bf)*math.cos(Bf)

        Rf = self.m_a*(1.-self.m_e1_2)/(math.sqrt((1.-self.m_e1_2*math.sin(Bf)*math.sin(Bf))*(1.-self.m_e1_2*math.sin(Bf)*math.sin(Bf))*(1.-self.m_e1_2*math.sin(Bf)*math.sin(Bf))))

        B = Bf - Nf*math.tan(Bf)/Rf*(D*D/2.-(5.+3.*Tf+Cf-9.*Tf*Cf)*D*D*D*D/24.+(61.+90*Tf+45.*Tf*Tf)*D*D*D*D*D*D/720.)
        L = 1./math.cos(Bf)*(D - (1.+2*Tf+Cf)*D*D*D/6. + (5.+28.*Tf+6.*Cf+8.*Tf*Cf+24.*Tf*Tf)*D*D*D*D*D/120. )

        pLo = self.rad2Deg(B)
        pLa = self.rad2Deg(L)

        if self.m_WithProjNumber:
        
            if self.m_projKind == SixProj:
            
                m_L0 = m_curProjNumber*6.-3.
            
            elif self.m_projKind == ThreeProj:
            
                m_L0 = m_curProjNumber*3.
            
        
        else:
        
            m_L0 = self.m_CentralMeridian
        
        pLa+=m_L0
        return pLa,pLo

    def deg2Rad(self, pDeg):
        return pDeg * GRAPH_PI / 180.0

    def rad2Deg(self, pRad):
        return pRad * 180.0 / GRAPH_PI

    def rotate(self, x,  y,  px,  py,  pAngle):
        # 计算旋转矩阵
        
        tangle = (GRAPH_PI*2*pAngle)/360
        A1=math.cos(tangle)
        A2=math.sin(tangle)
        B1=-A2
        B2=A1

        
        tx1 = x - px
        ty1 = y - py
        tx2 = A1*tx1 + B1*ty1
        ty2 = A2*tx1 + B2*ty1
        rx = tx2 + px
        ry = ty2 + py

        return rx,ry

if __name__ == '__main__':
    coordConvert = GGaussCoordConvert(CGCS2000, ThreeProj, False, 117, 0, 8533.542534226170, -187931.67959519500, 0.746937, 0.9997622102729840)
    x0,y0 = 13180999.586067896, 3488227.747001781 #492501.9332,3305753.016
    left = 118.34781646728516
    top = 29.914992371771078
    right = 118.47673416137695
    bottom = 29.82404002986084
    x,y = coordConvert.convToGlobal(y0,x0)
    x1,y1=118.40693389786115, 29.88072810006837
    print(x,y)
    print(gcj02towgs84(x,y))
    print(Mercator2lonLat(x0,y0))
    print(lonLat2Mercator(x1,y1))

