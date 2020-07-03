/**
 * Created by feng on 2017/3/21.
 *  常用的工具类
 */

goog.provide('ol.Utils');

goog.require('goog.asserts');


// 根据两点计算角度，返回角度
ol.Utils.calAngle = function(px,py, px0,py0)
{
    var tangle,tdegree;
    if (px != px0)
    {
        tangle = Math.atan( (py-py0)/(px-px0) );
        tdegree = tangle * 180 / Math.PI;
    }
    else
    {
        if (py < py0)
            tdegree = 270;
        else if (py > py0)
            tdegree = 90;
        else
            return 0;
    }

    if (px < px0)
        tdegree += 180;
    if (tdegree<0)
        tdegree += 360;

    return tdegree;
}

//   角度换算成弧度
ol.Utils.fromDegree = function(degree) {

    return Math.PI / 180 * degree;
}

//  弧度换算成角度
ol.Utils.toDegree = function(radian) {

    return 180 / Math.PI * radian;
}

//点到点之间的距离
ol.Utils.distancePointToPoint = function(px,py, px0, py0) {

    return Math.sqrt( (px-px0)*(px-px0) + (py-py0)*(py-py0) );
}

//沿线标注
ol.Utils.drawLineLabelText = function(text, textWidth, px1, py1, px2, py2, offset, ctx) {
    if(!ctx)
        return;

    var tx1,ty1,tx2,ty2;
    // 优先取从左到右的顺序。
    if (px1 > px2)
    {
        tx1 = px1;
        ty1 = py1;
        tx2 = px2;
        ty2 = py2;
    }
    else if (px1 < px2)
    {
        tx1 = px2;
        ty1 = py2;
        tx2 = px1;
        ty2 = py1;
    }
    else
    {
        // 垂直线取自上到下的顺序。
        if (py1 < py2)
        {
            tx1 = px1;
            ty1 = py1;
            tx2 = px2;
            ty2 = py2;
        }
        else
        {
            tx1 = px2;
            ty1 = py2;
            tx2 = px1;
            ty2 = py1;
        }
    }


    var tcx = (tx1 + tx2) / 2;
    var tcy = (ty1 + ty2) / 2;

    //将经纬度坐标转换成EPSG:3857
    var coords = ol.proj.fromLonLat([tcx,tcy]);
    //换算成像素坐标
    var pixel = map.getPixelFromCoordinate(coords);
    var tdegree = ol.Utils.calAngle(tx1, ty1, tx2, ty2);

    ctx.beginPath();
    ctx.save();
    ctx.translate(pixel[0], pixel[1]);
    ctx.rotate(-(ol.Utils.fromDegree(tdegree)));
    ctx.fillText(text, 0 - textWidth / 2, 0 - offset);
    ctx.restore();
}

ol.Utils.drawLabelTextEx = function(text, px1, py1, offset, ctx, scale, tdegree, color)
{	if(!ctx)
       return;

    //var coords = ol.proj.fromLonLat([px1,py1]);
	var coords = [px1, py1];
    //换算成像素坐标
    var pixel = map.getPixelFromCoordinate(coords);
	
    ctx.beginPath();
    ctx.save();
    ctx.translate(pixel[0], pixel[1]);
    ctx.rotate(-(ol.Utils.fromDegree(tdegree)));
	ctx.scale(scale, scale);
	ctx.fillStyle = color;
    ctx.fillText(text, 0 , 0 - offset);
	ctx.restore();
}

ol.Utils.drawRectText = function(text,leftTop,rightBottom, ctx, tdegree) {
	if(!ctx)
       return;
   
    //换算成像素坐标
    var pixel = map.getPixelFromCoordinate(leftTop);
	var pixel1 = map.getPixelFromCoordinate(rightBottom);
	
	if (pAngle)
	{
		ctx.save();
		ctx.translate(pRect.left, pRect.top);
		ctx.rotate(-pAngle * Math.PI / 180);
		tRect.move( -pRect.left, -pRect.top );
	}

    
}


ol.Utils.drawLabelText = function(text, px1, py1, offset, ctx, scale) {
	if(!ctx)
       return;

   
    //var coords = ol.proj.fromLonLat([px1,py1]);
	var coords = [px1, py1];
    //换算成像素坐标
    var pixel = map.getPixelFromCoordinate(coords);
	
    ctx.beginPath();
    ctx.save();
    ctx.translate(pixel[0], pixel[1]);

	ctx.scale(scale, scale);
    ctx.fillText(text, 0 , 0 - offset);
	ctx.restore();
}