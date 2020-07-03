/*!
 * jQuery Form Plugin
 * version: 3.51.0-2014.06.20
 * Requires jQuery v1.5 or later
 * Copyright (c) 2014 M. Alsup
 * Examples and documentation at: http://malsup.com/jquery/form/
 * Project repository: https://github.com/malsup/form
 * Dual licensed under the MIT and GPL licenses.
 * https://github.com/malsup/form#copyright-and-license
 */
/*global ActiveXObject */
(function(factory){"use strict";if(typeof define==='function'&&define.amd){define(['jquery'],factory)}else{factory((typeof(jQuery)!='undefined')?jQuery:window.Zepto)}}(function($){"use strict";var feature={};feature.fileapi=$("<input type='file'/>").get(0).files!==undefined;feature.formdata=window.FormData!==undefined;var hasProp=!!$.fn.prop;$.fn.attr2=function(){if(!hasProp){return this.attr.apply(this,arguments)}var val=this.prop.apply(this,arguments);if((val&&val.jquery)||typeof val==='string'){return val}return this.attr.apply(this,arguments)};$.fn.ajaxSubmit=function(options){if(!this.length){log('ajaxSubmit: skipping submit process - no element selected');return this}var method,action,url,$form=this;if(typeof options=='function'){options={success:options}}else if(options===undefined){options={}}method=options.type||this.attr2('method');action=options.url||this.attr2('action');url=(typeof action==='string')?$.trim(action):'';url=url||window.location.href||'';if(url){url=(url.match(/^([^#]+)/)||[])[1]}options=$.extend(true,{url:url,success:$.ajaxSettings.success,type:method||$.ajaxSettings.type,iframeSrc:/^https/i.test(window.location.href||'')?'javascript:false':'about:blank'},options);var veto={};this.trigger('form-pre-serialize',[this,options,veto]);if(veto.veto){log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');return this}if(options.beforeSerialize&&options.beforeSerialize(this,options)===false){log('ajaxSubmit: submit aborted via beforeSerialize callback');return this}var traditional=options.traditional;if(traditional===undefined){traditional=$.ajaxSettings.traditional}var elements=[];var qx,a=this.formToArray(options.semantic,elements);if(options.data){options.extraData=options.data;qx=$.param(options.data,traditional)}if(options.beforeSubmit&&options.beforeSubmit(a,this,options)===false){log('ajaxSubmit: submit aborted via beforeSubmit callback');return this}this.trigger('form-submit-validate',[a,this,options,veto]);if(veto.veto){log('ajaxSubmit: submit vetoed via form-submit-validate trigger');return this}var q=$.param(a,traditional);if(qx){q=(q?(q+'&'+qx):qx)}if(options.type.toUpperCase()=='GET'){options.url+=(options.url.indexOf('?')>=0?'&':'?')+q;options.data=null}else{options.data=q}var callbacks=[];if(options.resetForm){callbacks.push(function(){$form.resetForm()})}if(options.clearForm){callbacks.push(function(){$form.clearForm(options.includeHidden)})}if(!options.dataType&&options.target){var oldSuccess=options.success||function(){};callbacks.push(function(data){var fn=options.replaceTarget?'replaceWith':'html';$(options.target)[fn](data).each(oldSuccess,arguments)})}else if(options.success){callbacks.push(options.success)}options.success=function(data,status,xhr){var context=options.context||this;for(var i=0,max=callbacks.length;i<max;i++){callbacks[i].apply(context,[data,status,xhr||$form,$form])}};if(options.error){var oldError=options.error;options.error=function(xhr,status,error){var context=options.context||this;oldError.apply(context,[xhr,status,error,$form])}}if(options.complete){var oldComplete=options.complete;options.complete=function(xhr,status){var context=options.context||this;oldComplete.apply(context,[xhr,status,$form])}}var fileInputs=$('input[type=file]:enabled',this).filter(function(){return $(this).val()!==''});var hasFileInputs=fileInputs.length>0;var mp='multipart/form-data';var multipart=($form.attr('enctype')==mp||$form.attr('encoding')==mp);var fileAPI=feature.fileapi&&feature.formdata;log("fileAPI :"+fileAPI);var shouldUseFrame=(hasFileInputs||multipart)&&!fileAPI;var jqxhr;if(options.iframe!==false&&(options.iframe||shouldUseFrame)){if(options.closeKeepAlive){$.get(options.closeKeepAlive,function(){jqxhr=fileUploadIframe(a)})}else{jqxhr=fileUploadIframe(a)}}else if((hasFileInputs||multipart)&&fileAPI){jqxhr=fileUploadXhr(a)}else{jqxhr=$.ajax(options)}$form.removeData('jqxhr').data('jqxhr',jqxhr);for(var k=0;k<elements.length;k++){elements[k]=null}this.trigger('form-submit-notify',[this,options]);return this;function deepSerialize(extraData){var serialized=$.param(extraData,options.traditional).split('&');var len=serialized.length;var result=[];var i,part;for(i=0;i<len;i++){serialized[i]=serialized[i].replace(/\+/g,' ');part=serialized[i].split('=');result.push([decodeURIComponent(part[0]),decodeURIComponent(part[1])])}return result}function fileUploadXhr(a){var formdata=new FormData();for(var i=0;i<a.length;i++){formdata.append(a[i].name,a[i].value)}if(options.extraData){var serializedData=deepSerialize(options.extraData);for(i=0;i<serializedData.length;i++){if(serializedData[i]){formdata.append(serializedData[i][0],serializedData[i][1])}}}options.data=null;var s=$.extend(true,{},$.ajaxSettings,options,{contentType:false,processData:false,cache:false,type:method||'POST'});if(options.uploadProgress){s.xhr=function(){var xhr=$.ajaxSettings.xhr();if(xhr.upload){xhr.upload.addEventListener('progress',function(event){var percent=0;var position=event.loaded||event.position;var total=event.total;if(event.lengthComputable){percent=Math.ceil(position/total*100)}options.uploadProgress(event,position,total,percent)},false)}return xhr}}s.data=null;var beforeSend=s.beforeSend;s.beforeSend=function(xhr,o){if(options.formData){o.data=options.formData}else{o.data=formdata}if(beforeSend){beforeSend.call(this,xhr,o)}};return $.ajax(s)}function fileUploadIframe(a){var form=$form[0],el,i,s,g,id,$io,io,xhr,sub,n,timedOut,timeoutHandle;var deferred=$.Deferred();deferred.abort=function(status){xhr.abort(status)};if(a){for(i=0;i<elements.length;i++){el=$(elements[i]);if(hasProp){el.prop('disabled',false)}else{el.removeAttr('disabled')}}}s=$.extend(true,{},$.ajaxSettings,options);s.context=s.context||s;id='jqFormIO'+(new Date().getTime());if(s.iframeTarget){$io=$(s.iframeTarget);n=$io.attr2('name');if(!n){$io.attr2('name',id)}else{id=n}}else{$io=$('<iframe name="'+id+'" src="'+s.iframeSrc+'" />');$io.css({position:'absolute',top:'-1000px',left:'-1000px'})}io=$io[0];xhr={aborted:0,responseText:null,responseXML:null,status:0,statusText:'n/a',getAllResponseHeaders:function(){},getResponseHeader:function(){},setRequestHeader:function(){},abort:function(status){var e=(status==='timeout'?'timeout':'aborted');log('aborting upload... '+e);this.aborted=1;try{if(io.contentWindow.document.execCommand){io.contentWindow.document.execCommand('Stop')}}catch(ignore){}$io.attr('src',s.iframeSrc);xhr.error=e;if(s.error){s.error.call(s.context,xhr,e,status)}if(g){$.event.trigger("ajaxError",[xhr,s,e])}if(s.complete){s.complete.call(s.context,xhr,e)}}};g=s.global;if(g&&0===$.active++){$.event.trigger("ajaxStart")}if(g){$.event.trigger("ajaxSend",[xhr,s])}if(s.beforeSend&&s.beforeSend.call(s.context,xhr,s)===false){if(s.global){$.active--}deferred.reject();return deferred}if(xhr.aborted){deferred.reject();return deferred}sub=form.clk;if(sub){n=sub.name;if(n&&!sub.disabled){s.extraData=s.extraData||{};s.extraData[n]=sub.value;if(sub.type=="image"){s.extraData[n+'.x']=form.clk_x;s.extraData[n+'.y']=form.clk_y}}}var CLIENT_TIMEOUT_ABORT=1;var SERVER_ABORT=2;function getDoc(frame){var doc=null;try{if(frame.contentWindow){doc=frame.contentWindow.document}}catch(err){log('cannot get iframe.contentWindow document: '+err)}if(doc){return doc}try{doc=frame.contentDocument?frame.contentDocument:frame.document}catch(err){log('cannot get iframe.contentDocument: '+err);doc=frame.document}return doc}var csrf_token=$('meta[name=csrf-token]').attr('content');var csrf_param=$('meta[name=csrf-param]').attr('content');if(csrf_param&&csrf_token){s.extraData=s.extraData||{};s.extraData[csrf_param]=csrf_token}function doSubmit(){var t=$form.attr2('target'),a=$form.attr2('action'),mp='multipart/form-data',et=$form.attr('enctype')||$form.attr('encoding')||mp;form.setAttribute('target',id);if(!method||/post/i.test(method)){form.setAttribute('method','POST')}if(a!=s.url){form.setAttribute('action',s.url)}if(!s.skipEncodingOverride&&(!method||/post/i.test(method))){$form.attr({encoding:'multipart/form-data',enctype:'multipart/form-data'})}if(s.timeout){timeoutHandle=setTimeout(function(){timedOut=true;cb(CLIENT_TIMEOUT_ABORT)},s.timeout)}function checkState(){try{var state=getDoc(io).readyState;log('state = '+state);if(state&&state.toLowerCase()=='uninitialized'){setTimeout(checkState,50)}}catch(e){log('Server abort: ',e,' (',e.name,')');cb(SERVER_ABORT);if(timeoutHandle){clearTimeout(timeoutHandle)}timeoutHandle=undefined}}var extraInputs=[];try{if(s.extraData){for(var n in s.extraData){if(s.extraData.hasOwnProperty(n)){if($.isPlainObject(s.extraData[n])&&s.extraData[n].hasOwnProperty('name')&&s.extraData[n].hasOwnProperty('value')){extraInputs.push($('<input type="hidden" name="'+s.extraData[n].name+'">').val(s.extraData[n].value).appendTo(form)[0])}else{extraInputs.push($('<input type="hidden" name="'+n+'">').val(s.extraData[n]).appendTo(form)[0])}}}}if(!s.iframeTarget){$io.appendTo('body')}if(io.attachEvent){io.attachEvent('onload',cb)}else{io.addEventListener('load',cb,false)}setTimeout(checkState,15);try{form.submit()}catch(err){var submitFn=document.createElement('form').submit;submitFn.apply(form)}}finally{form.setAttribute('action',a);form.setAttribute('enctype',et);if(t){form.setAttribute('target',t)}else{$form.removeAttr('target')}$(extraInputs).remove()}}if(s.forceSync){doSubmit()}else{setTimeout(doSubmit,10)}var data,doc,domCheckCount=50,callbackProcessed;function cb(e){if(xhr.aborted||callbackProcessed){return}doc=getDoc(io);if(!doc){log('cannot access response document');e=SERVER_ABORT}if(e===CLIENT_TIMEOUT_ABORT&&xhr){xhr.abort('timeout');deferred.reject(xhr,'timeout');return}else if(e==SERVER_ABORT&&xhr){xhr.abort('server abort');deferred.reject(xhr,'error','server abort');return}if(!doc||doc.location.href==s.iframeSrc){if(!timedOut){return}}if(io.detachEvent){io.detachEvent('onload',cb)}else{io.removeEventListener('load',cb,false)}var status='success',errMsg;try{if(timedOut){throw'timeout';}var isXml=s.dataType=='xml'||doc.XMLDocument||$.isXMLDoc(doc);log('isXml='+isXml);if(!isXml&&window.opera&&(doc.body===null||!doc.body.innerHTML)){if(--domCheckCount){log('requeing onLoad callback, DOM not available');setTimeout(cb,250);return}}var docRoot=doc.body?doc.body:doc.documentElement;xhr.responseText=docRoot?docRoot.innerHTML:null;xhr.responseXML=doc.XMLDocument?doc.XMLDocument:doc;if(isXml){s.dataType='xml'}xhr.getResponseHeader=function(header){var headers={'content-type':s.dataType};return headers[header.toLowerCase()]};if(docRoot){xhr.status=Number(docRoot.getAttribute('status'))||xhr.status;xhr.statusText=docRoot.getAttribute('statusText')||xhr.statusText}var dt=(s.dataType||'').toLowerCase();var scr=/(json|script|text)/.test(dt);if(scr||s.textarea){var ta=doc.getElementsByTagName('textarea')[0];if(ta){xhr.responseText=ta.value;xhr.status=Number(ta.getAttribute('status'))||xhr.status;xhr.statusText=ta.getAttribute('statusText')||xhr.statusText}else if(scr){var pre=doc.getElementsByTagName('pre')[0];var b=doc.getElementsByTagName('body')[0];if(pre){xhr.responseText=pre.textContent?pre.textContent:pre.innerText}else if(b){xhr.responseText=b.textContent?b.textContent:b.innerText}}}else if(dt=='xml'&&!xhr.responseXML&&xhr.responseText){xhr.responseXML=toXml(xhr.responseText)}try{data=httpData(xhr,dt,s)}catch(err){status='parsererror';xhr.error=errMsg=(err||status)}}catch(err){log('error caught: ',err);status='error';xhr.error=errMsg=(err||status)}if(xhr.aborted){log('upload aborted');status=null}if(xhr.status){status=(xhr.status>=200&&xhr.status<300||xhr.status===304)?'success':'error'}if(status==='success'){if(s.success){s.success.call(s.context,data,'success',xhr)}deferred.resolve(xhr.responseText,'success',xhr);if(g){$.event.trigger("ajaxSuccess",[xhr,s])}}else if(status){if(errMsg===undefined){errMsg=xhr.statusText}if(s.error){s.error.call(s.context,xhr,status,errMsg)}deferred.reject(xhr,'error',errMsg);if(g){$.event.trigger("ajaxError",[xhr,s,errMsg])}}if(g){$.event.trigger("ajaxComplete",[xhr,s])}if(g&&!--$.active){$.event.trigger("ajaxStop")}if(s.complete){s.complete.call(s.context,xhr,status)}callbackProcessed=true;if(s.timeout){clearTimeout(timeoutHandle)}setTimeout(function(){if(!s.iframeTarget){$io.remove()}else{$io.attr('src',s.iframeSrc)}xhr.responseXML=null},100)}var toXml=$.parseXML||function(s,doc){if(window.ActiveXObject){doc=new ActiveXObject('Microsoft.XMLDOM');doc.async='false';doc.loadXML(s)}else{doc=(new DOMParser()).parseFromString(s,'text/xml')}return(doc&&doc.documentElement&&doc.documentElement.nodeName!='parsererror')?doc:null};var parseJSON=$.parseJSON||function(s){return window['eval']('('+s+')')};var httpData=function(xhr,type,s){var ct=xhr.getResponseHeader('content-type')||'',xml=type==='xml'||!type&&ct.indexOf('xml')>=0,data=xml?xhr.responseXML:xhr.responseText;if(xml&&data.documentElement.nodeName==='parsererror'){if($.error){$.error('parsererror')}}if(s&&s.dataFilter){data=s.dataFilter(data,type)}if(typeof data==='string'){if(type==='json'||!type&&ct.indexOf('json')>=0){data=parseJSON(data)}else if(type==="script"||!type&&ct.indexOf("javascript")>=0){$.globalEval(data)}}return data};return deferred}};$.fn.ajaxForm=function(options){options=options||{};options.delegation=options.delegation&&$.isFunction($.fn.on);if(!options.delegation&&this.length===0){var o={s:this.selector,c:this.context};if(!$.isReady&&o.s){log('DOM not ready, queuing ajaxForm');$(function(){$(o.s,o.c).ajaxForm(options)});return this}log('terminating; zero elements found by selector'+($.isReady?'':' (DOM not ready)'));return this}if(options.delegation){$(document).off('submit.form-plugin',this.selector,doAjaxSubmit).off('click.form-plugin',this.selector,captureSubmittingElement).on('submit.form-plugin',this.selector,options,doAjaxSubmit).on('click.form-plugin',this.selector,options,captureSubmittingElement);return this}return this.ajaxFormUnbind().bind('submit.form-plugin',options,doAjaxSubmit).bind('click.form-plugin',options,captureSubmittingElement)};function doAjaxSubmit(e){var options=e.data;if(!e.isDefaultPrevented()){e.preventDefault();$(e.target).ajaxSubmit(options)}}function captureSubmittingElement(e){var target=e.target;var $el=$(target);if(!($el.is("[type=submit],[type=image]"))){var t=$el.closest('[type=submit]');if(t.length===0){return}target=t[0]}var form=this;form.clk=target;if(target.type=='image'){if(e.offsetX!==undefined){form.clk_x=e.offsetX;form.clk_y=e.offsetY}else if(typeof $.fn.offset=='function'){var offset=$el.offset();form.clk_x=e.pageX-offset.left;form.clk_y=e.pageY-offset.top}else{form.clk_x=e.pageX-target.offsetLeft;form.clk_y=e.pageY-target.offsetTop}}setTimeout(function(){form.clk=form.clk_x=form.clk_y=null},100)}$.fn.ajaxFormUnbind=function(){return this.unbind('submit.form-plugin click.form-plugin')};$.fn.formToArray=function(semantic,elements){var a=[];if(this.length===0){return a}var form=this[0];var formId=this.attr('id');var els=semantic?form.getElementsByTagName('*'):form.elements;var els2;if(els&&!/MSIE [678]/.test(navigator.userAgent)){els=$(els).get()}if(formId){els2=$(':input[form="'+formId+'"]').get();if(els2.length){els=(els||[]).concat(els2)}}if(!els||!els.length){return a}var i,j,n,v,el,max,jmax;for(i=0,max=els.length;i<max;i++){el=els[i];n=el.name;if(!n||el.disabled){continue}if(semantic&&form.clk&&el.type=="image"){if(form.clk==el){a.push({name:n,value:$(el).val(),type:el.type});a.push({name:n+'.x',value:form.clk_x},{name:n+'.y',value:form.clk_y})}continue}v=$.fieldValue(el,true);if(v&&v.constructor==Array){if(elements){elements.push(el)}for(j=0,jmax=v.length;j<jmax;j++){a.push({name:n,value:v[j]})}}else if(feature.fileapi&&el.type=='file'){if(elements){elements.push(el)}var files=el.files;if(files.length){for(j=0;j<files.length;j++){a.push({name:n,value:files[j],type:el.type})}}else{a.push({name:n,value:'',type:el.type})}}else if(v!==null&&typeof v!='undefined'){if(elements){elements.push(el)}a.push({name:n,value:v,type:el.type,required:el.required})}}if(!semantic&&form.clk){var $input=$(form.clk),input=$input[0];n=input.name;if(n&&!input.disabled&&input.type=='image'){a.push({name:n,value:$input.val()});a.push({name:n+'.x',value:form.clk_x},{name:n+'.y',value:form.clk_y})}}return a};$.fn.formSerialize=function(semantic){return $.param(this.formToArray(semantic))};$.fn.fieldSerialize=function(successful){var a=[];this.each(function(){var n=this.name;if(!n){return}var v=$.fieldValue(this,successful);if(v&&v.constructor==Array){for(var i=0,max=v.length;i<max;i++){a.push({name:n,value:v[i]})}}else if(v!==null&&typeof v!='undefined'){a.push({name:this.name,value:v})}});return $.param(a)};$.fn.fieldValue=function(successful){for(var val=[],i=0,max=this.length;i<max;i++){var el=this[i];var v=$.fieldValue(el,successful);if(v===null||typeof v=='undefined'||(v.constructor==Array&&!v.length)){continue}if(v.constructor==Array){$.merge(val,v)}else{val.push(v)}}return val};$.fieldValue=function(el,successful){var n=el.name,t=el.type,tag=el.tagName.toLowerCase();if(successful===undefined){successful=true}if(successful&&(!n||el.disabled||t=='reset'||t=='button'||(t=='checkbox'||t=='radio')&&!el.checked||(t=='submit'||t=='image')&&el.form&&el.form.clk!=el||tag=='select'&&el.selectedIndex==-1)){return null}if(tag=='select'){var index=el.selectedIndex;if(index<0){return null}var a=[],ops=el.options;var one=(t=='select-one');var max=(one?index+1:ops.length);for(var i=(one?index:0);i<max;i++){var op=ops[i];if(op.selected){var v=op.value;if(!v){v=(op.attributes&&op.attributes.value&&!(op.attributes.value.specified))?op.text:op.value}if(one){return v}a.push(v)}}return a}return $(el).val()};$.fn.clearForm=function(includeHidden){return this.each(function(){$('input,select,textarea',this).clearFields(includeHidden)})};$.fn.clearFields=$.fn.clearInputs=function(includeHidden){var re=/^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i;return this.each(function(){var t=this.type,tag=this.tagName.toLowerCase();if(re.test(t)||tag=='textarea'){this.value=''}else if(t=='checkbox'||t=='radio'){this.checked=false}else if(tag=='select'){this.selectedIndex=-1}else if(t=="file"){if(/MSIE/.test(navigator.userAgent)){$(this).replaceWith($(this).clone(true))}else{$(this).val('')}}else if(includeHidden){if((includeHidden===true&&/hidden/.test(t))||(typeof includeHidden=='string'&&$(this).is(includeHidden))){this.value=''}}})};$.fn.resetForm=function(){return this.each(function(){if(typeof this.reset=='function'||(typeof this.reset=='object'&&!this.reset.nodeType)){this.reset()}})};$.fn.enable=function(b){if(b===undefined){b=true}return this.each(function(){this.disabled=!b})};$.fn.selected=function(select){if(select===undefined){select=true}return this.each(function(){var t=this.type;if(t=='checkbox'||t=='radio'){this.checked=select}else if(this.tagName.toLowerCase()=='option'){var $sel=$(this).parent('select');if(select&&$sel[0]&&$sel[0].type=='select-one'){$sel.find('option').selected(false)}this.selected=select}})};$.fn.ajaxSubmit.debug=false;function log(){if(!$.fn.ajaxSubmit.debug){return}var msg='[jquery.form] '+Array.prototype.join.call(arguments,'');if(window.console&&window.console.log){window.console.log(msg)}else if(window.opera&&window.opera.postError){window.opera.postError(msg)}}}));
/**
 * form autofill (jQuery plugin)
 * Version: 0.1
 * Released: 2011-11-30
 * 
 * Copyright (c) 2011 Creative Area
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Require jQuery
 * http://jquery.com/
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */
(function($){$.fn.extend({autofill:function(data,options){var settings={findbyname:true,restrict:true},self=this;if(options){$.extend(settings,options)}return this.each(function(){$.each(data,function(k,v){var selector,elt;if(settings.findbyname){selector='[name="'+k+'"]';elt=(settings.restrict)?self.find(selector):$(selector);if(elt.length==1){elt.val((elt.attr("type")=="checkbox")?[v]:v)}else if(elt.length>1){elt.val([v])}else{selector='[name="'+k+'[]"]';elt=(settings.restrict)?self.find(selector):$(selector);elt.each(function(){$(this).val(v)})}}else{selector='#'+k;elt=(settings.restrict)?self.find(selector):$(selector);if(elt.length==1){elt.val((elt.attr("type")=="checkbox")?[v]:v)}else{var radiofound=false;elt=(settings.restrict)?self.find('input:radio[name="'+k+'"]'):$('input:radio[name="'+k+'"]');elt.each(function(){radiofound=true;if(this.value==v){this.checked=true}});if(!radiofound){elt=(settings.restrict)?self.find('input:checkbox[name="'+k+'[]"]'):$('input:checkbox[name="'+k+'[]"]');elt.each(function(){$(this).val(v)})}}}})})}})})(jQuery);
var app = function() {
    var e = function() {
        t(),
        o(),
        a(),
        l(),
        m(),
        n(),
        i(),
        j(),
        k()
    }
      , t = function() {
        //$("#toggle-left-button").tooltip();
    }
      , n = function() {
        $(".actions > .fa-chevron-down").click(function() {
            $(this).parent().parent().next().slideToggle("fast"),
            $(this).toggleClass("fa-chevron-down fa-chevron-up")
        })
    }
      , o = function() {
        $("#toggle-left").bind("click", function(e) {
            $(".sidebarRight").hasClass(".sidebar-toggle-right") || ($(".sidebarRight").removeClass("sidebar-toggle-right"),
            $(".main-content-wrapper").removeClass("main-content-toggle-right")),
            $(".sidebar").toggleClass("sidebar-toggle"),
            $(".main-content-wrapper").toggleClass("main-content-toggle-left"),
            $(".imitateMenuBg").toggleClass("imitateMenuBg-left"),
            $(".defaultFootBg").toggleClass("defaultFootBg-left"),
            $(".info-seach-btn-input").toggleClass("info-seach-btn-input-left"),
            
            e.stopPropagation()
        })
    }
      , a = function() {
        $("#toggle-right").bind("click", function(e) {
            $(".sidebar").hasClass(".sidebar-toggle") || ($(".sidebar").addClass("sidebar-toggle"),
            $(".main-content-wrapper").addClass("main-content-toggle-left")),
            $(".sidebarRight").toggleClass("sidebar-toggle-right animated bounceInRight"),
            $(".main-content-wrapper").toggleClass("main-content-toggle-right"),
            $(window).width() < 660 && ($(".sidebar").removeClass("sidebar-toggle"),
            $(".main-content-wrapper").removeClass("main-content-toggle-left main-content-toggle-right")),
            console.log("toggle-right"),
            e.stopPropagation()
        })
    }
      , i = function() {
        $(".actions > .fa-times").click(function() {
            $(this).parent().parent().parent().fadeOut()
        })
    }
      , j = function() {
    	  $('#simpleQueryParam').bind('keyup', function(event) {
    			if (event.keyCode == "13") {
    				//回车执行查询
    				$('#search_button').click();
    			}
    		})
      }
      , k = function() {
    	  $('#search_condition').bind('keyup', function(event) {
    			if (event.keyCode == "13") {
    				//回车执行查询
    				$('#treeSearch').click();
    			}
    		})
      }
     , l = function() {
        $("#leftside-navigation .sub-menu > a").click(function(e) {
            $("#leftside-navigation ul ul").slideUp();
            $(this).addClass('activeLine').find('i:eq(1)').toggleClass('fa-angle-right fa-angle-down');
            $(this).next().is(":visible") || $(this).next().slideDown()
                                            .parents('.sub-menu').siblings().children('a').removeClass('activeLine')
                                            .find('i:eq(1)').removeClass('fa-angle-down').addClass("fa-angle-right");
            e.stopPropagation();
        });
        $("ul.second-menu-ul li >a").click(function(e) {
        	$(this).parent().siblings().children('a').removeClass('open');
        	e.stopPropagation();
        });
        /*---二级目录 links---*/
        var url = window.location;
        var element = $('ul.second-menu-ul li a').filter(function() {
            return this.href == url || url.href.indexOf(this.href) == 0;
        }).addClass('open');
        if ($('ul.second-menu-ul li a').is('a')) {
        	element.parents('li.sub-menu').addClass('active').siblings().removeClass('active');
        	//element.parents('li.sub-menu').children('a').addClass('activeLine');
        	element.parents('li.sub-menu').children('a').addClass('activeLine').find('i:eq(1)').toggleClass('fa-angle-right fa-angle-down'); /*同辈i 切换方向图标样式*/
        	element.parents('ul.second-menu-ul').show();
        };
        /*---三级目录  links---*/
        var urlSec = window.location;
        var elementSec = $('.second-menu-ul ul a').filter(function() {
            return this.href == urlSec || urlSec.href.indexOf(this.href) == 0;
        }).addClass('open');
        if ($('.second-menu ul li').is('li')) {
        	elementSec.parents('li.sub-menu').addClass('active').siblings().removeClass('active');
        	elementSec.parents('li.second-menu').children('a').find('i:eq(1)').toggleClass('fa-angle-right fa-angle-down'); /*同辈i 切换方向图标样式*/
        	elementSec.parents('li.second-menu').siblings().children('ul').hide();
        };
        //二级菜单点击隐藏三级菜单
        $("#leftside-navigation .second-menu > a.open").parent().siblings().children("ul").hide();
    }
   , m = function() {
        $("#leftside-navigation .second-menu > a").click(function(e) {
            $("#leftside-navigation ul ul ul").slideUp(),
            $(this).next().is(":visible") || $(this).next().slideDown(),
            e.stopPropagation();
        })
    }
      , s = function() {
        $(".timer").countTo()
    }
      , r = function() {
        $("#map").vectorMap({
            map: "world_mill_en",
            backgroundColor: "transparent",
            regionStyle: {
                initial: {
                    fill: "#1ABC9C"
                },
                hover: {
                    "fill-opacity": .8
                }
            },
            markerStyle: {
                initial: {
                    r: 10
                },
                hover: {
                    r: 12,
                    stroke: "rgba(255,255,255,0.8)",
                    "stroke-width": 3
                }
            },
            markers: [{
                latLng: [27.9881, 86.9253],
                name: "36 Employees",
                style: {
                    fill: "#E84C3D",
                    stroke: "rgba(255,255,255,0.7)",
                    "stroke-width": 3
                }
            }, {
                latLng: [48.8582, 2.2945],
                name: "58 Employees",
                style: {
                    fill: "#E84C3D",
                    stroke: "rgba(255,255,255,0.7)",
                    "stroke-width": 3
                }
            }, {
                latLng: [-40.6892, -74.0444],
                name: "109 Employees",
                style: {
                    fill: "#E84C3D",
                    stroke: "rgba(255,255,255,0.7)",
                    "stroke-width": 3
                }
            }, {
                latLng: [34.05, -118.25],
                name: "85 Employees ",
                style: {
                    fill: "#E84C3D",
                    stroke: "rgba(255,255,255,0.7)",
                    "stroke-width": 3
                }
            }]
        })
    }
      , c = function() {
        var e = new Skycons({
            color: "white"
        });
        e.set("clear-day", Skycons.CLEAR_DAY),
        e.set("clear-night", Skycons.CLEAR_NIGHT),
        e.set("partly-cloudy-day", Skycons.PARTLY_CLOUDY_DAY),
        e.set("partly-cloudy-night", Skycons.PARTLY_CLOUDY_NIGHT),
        e.set("cloudy", Skycons.CLOUDY),
        e.set("rain", Skycons.RAIN),
        e.set("sleet", Skycons.SLEET),
        e.set("snow", Skycons.SNOW),
        e.set("wind", Skycons.WIND),
        e.set("fog", Skycons.FOG),
        e.play()
    }
      , g = function() {
        Morris.Donut({
            element: "donut-example",
            data: [{
                label: "Chrome",
                value: 73
            }, {
                label: "Firefox",
                value: 71
            }, {
                label: "Safari",
                value: 69
            }, {
                label: "Internet Explorer",
                value: 40
            }, {
                label: "Opera",
                value: 20
            }, {
                label: "Android Browser",
                value: 10
            }],
            colors: ["#1abc9c", "#293949", "#e84c3d", "#3598db", "#2dcc70", "#f1c40f"]
        })
    }
      , d = function() {
        $(".slider-span").slider()
    }
    ;
    return {
        init: e,
        timer: s,
        map: r,
        sliders: d,
        weather: c,
        morrisPie: g
    }
}();
$(document).ready(function() {
    app.init()
});


/*------------------
时间日期------------*/
$(document).ready(function(){
  $(function(){
    $("#clock").MyDigitClock({
        fontSize:32, 
        fontColor: "grey", 
        fontWeight:"bold", 
        bAmPm:true,
        background:'#fff',
        timeFormat: '{HH}:{MM}'
    });    $("#clockAP").MyDigitClock({
        fontSize:15, 
        fontColor:"grey",
        background:"#fff",
        fontWeight:"bold",
        bAmPm:true,
        timeFormat: ''}
    );
    $("#clock").MyDigitClock({
        fontSize:32, 
        fontColor: "grey", 
        fontWeight:"bold", 
        bAmPm:true,
        background:'#fff',
        timeFormat: '{HH}:{MM}'
    });
    $("#monthsDay p").html(DayToday()).addClass('clockBoxCon');
    $("#monthsDay h1").html(DateToday()).addClass('clockBoxCon');
    $("#monthsDay span").html(Months());
    $("#clock").addClass('clockBoxCon');
    $("#clockAP").addClass('clockBoxCon');
  });
  /**
   * 在bootstrap中，打开一个modal时，会给body添加modal-open类，这个类限制body overflow 为hidden，使其无法滚动
   * 在关闭modal时，会移除modal-open类，使body能够正常滚动
   * 问题在于，打开多个modal时，如果关闭上面的modal，也会触发移除modal-open的操作，这样就让body正常滚动了，而此时，页面仍有modal可见
   * 这与需求不符合，需求是任何时候，只有有modal，body就不能有滚动条
   * 所以我加了一个关闭时回调，判断页面如果仍然有可见的modal，就重新添加modal-open类
   * TODO: 测试在iframe情况下是否可用
   */
  $(document).on("hidden.bs.modal",".modal",
        function(){
            if($('.modal.in').length>0){
                $(document.body).addClass("modal-open")
            }
        }
    )

});



/**
 * 时钟MyDigitClock
 *
 * 2016-07-14  by LEFFY
 *
 *
 */
    
(function($) {

    var _options = {};
    var _container = {};

    jQuery.fn.MyDigitClock = function(options) {
        var id = $(this).get(0).id;
        _options[id] = $.extend({}, $.fn.MyDigitClock.defaults, options);

        return this.each(function()
        {
            _container[id] = $(this);
            showClock(id);
        });
        
        function showClock(id)
        {
            var d = new Date;
            var h = d.getHours();
            var m = d.getMinutes();
            var s = d.getSeconds();
            var ampm = "";
            if (_options[id].bAmPm)
            {
                if (h>12)
                {
                    
                    ampm = " 下午";
                }
                else
                {
                    ampm = " 上午";
                }
            }
            
            var templateStr = _options[id].timeFormat + "<span class='PTclock'>"+ ampm +"</span>";
        
            templateStr = templateStr.replace("{HH}", getDD(h));
            templateStr = templateStr.replace("{MM}", getDD(m));
            templateStr = templateStr.replace("{SS}", getDD(s));
        
            var obj = $("#"+id);
            obj.css("fontSize", _options[id].fontSize);
            obj.css("fontFamily", _options[id].fontFamily);
            obj.css("color", _options[id].fontColor);
            obj.css("background", _options[id].background);
            obj.css("fontWeight", _options[id].fontWeight);
            
            //change reading
            obj.html(templateStr)
            
            //toggle hands
            if (_options[id].bShowHeartBeat)
            {
                obj.find("#ch1").fadeTo(800, 0.1);
                obj.find("#ch2").fadeTo(800, 0.1);
            }
            setTimeout(function(){showClock(id)}, 1000);
        }
        
        function getDD(num)
        {
            return (num>=10)?num:"0"+num;
        }
        
        function refreshClock()
        {
            setupClock();
        }
    }
})(jQuery);
function Months(){  
    var now = new Date();  
    var mm = now.getMonth()+1;  
    var cl = '<font color="#ffffff">';  
    if (now.getDay() == 0) cl = '<font color="#ffffff">';  
    if (now.getDay() == 6) cl = '<font color="#ffffff">';  
    return(cl +  mm + '月</font>');  
}
function DateToday(){  
    var now = new Date();  
    var cl = '<font color="#ffffff">';  
    if (now.getDay() == 0) cl = '<font color="#ffffff">';  
    if (now.getDay() == 6) cl = '<font color="#ffffff">';  
    return(cl +  now.getDate());  
}  
function DayToday(){  
    var day = new Array();  
    day[0] = "星期日";  
    day[1] = "星期一";  
    day[2] = "星期二";  
    day[3] = "星期三";  
    day[4] = "星期四";  
    day[5] = "星期五";  
    day[6] = "星期六";  
    var now = new Date();  
    var cl = '<font color="#ffffff">';  
    if (now.getDay() == 0) cl = '<font color="#ffffff">';  
    if (now.getDay() == 6) cl = '<font color="#ffffff">';  
    return(cl +  day[now.getDay()] + '</font>');  
  }  
  
/*
 * JQuery zTree core v3.5.24
 * http://zTree.me/
 *
 * Copyright (c) 2010 Hunter.z
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: hunter.z@263.net
 * Date: 2016-06-06
 */
(function($){
	var settings = {}, roots = {}, caches = {},
	//default consts of core
	_consts = {
		className: {
			BUTTON: "button",
			LEVEL: "level",
			ICO_LOADING: "ico_loading",
			SWITCH: "switch",
			NAME: 'node_name'
		},
		event: {
			NODECREATED: "ztree_nodeCreated",
			CLICK: "ztree_click",
			EXPAND: "ztree_expand",
			COLLAPSE: "ztree_collapse",
			ASYNC_SUCCESS: "ztree_async_success",
			ASYNC_ERROR: "ztree_async_error",
			REMOVE: "ztree_remove",
			SELECTED: "ztree_selected",
			UNSELECTED: "ztree_unselected"
		},
		id: {
			A: "_a",
			COUNT: "_count",
			ICON: "_ico",
			SPAN: "_span",
			SWITCH: "_switch",
			UL: "_ul"
		},
		line: {
			ROOT: "root",
			ROOTS: "roots",
			CENTER: "center",
			BOTTOM: "bottom",
			NOLINE: "noline",
			LINE: "line"
		},
		folder: {
			OPEN: "open",
			CLOSE: "close",
			DOCU: "docu"
		},
		node: {
			CURSELECTED: "curSelectedNode"
		}
	},
	//default setting of core
	_setting = {
		treeId: "",
		treeObj: null,
		view: {
			addDiyDom: null,
			autoCancelSelected: true,
			dblClickExpand: true,
			expandSpeed: "fast",
			fontCss: {},
			countClass: "",
			nameIsHTML: false,
			countIsHTML: false,
			selectedMulti: true,
			showIcon: true,
			showLine: true,
			showTitle: true,
			txtSelectedEnable: false
		},
		data: {
			key: {
				children: "children",
				name: "name",
				title: "",
				url: "url",
				icon: "icon",
				count: "count"
			},
			simpleData: {
				enable: false,
				idKey: "id",
				pIdKey: "pId",
				rootPId: null
			},
			keep: {
				parent: false,
				leaf: false
			}
		},
		async: {
			enable: false,
			contentType: "application/x-www-form-urlencoded",
			type: "post",
			dataType: "text",
			url: "",
			autoParam: [],
			otherParam: [],
			dataFilter: null
		},
		callback: {
			beforeAsync:null,
			beforeClick:null,
			beforeDblClick:null,
			beforeRightClick:null,
			beforeMouseDown:null,
			beforeMouseUp:null,
			beforeExpand:null,
			beforeCollapse:null,
			beforeRemove:null,

			onAsyncError:null,
			onAsyncSuccess:null,
			onNodeCreated:null,
			onClick:null,
			onDblClick:null,
			onRightClick:null,
			onMouseDown:null,
			onMouseUp:null,
			onExpand:null,
			onCollapse:null,
			onRemove:null
		}
	},
	//default root of core
	//zTree use root to save full data
	_initRoot = function (setting) {
		var r = data.getRoot(setting);
		if (!r) {
			r = {};
			data.setRoot(setting, r);
		}
		r[setting.data.key.children] = [];
		r.expandTriggerFlag = false;
		r.curSelectedList = [];
		r.noSelection = true;
		r.createdNodes = [];
		r.zId = 0;
		r._ver = (new Date()).getTime();
	},
	//default cache of core
	_initCache = function(setting) {
		var c = data.getCache(setting);
		if (!c) {
			c = {};
			data.setCache(setting, c);
		}
		c.nodes = [];
		c.doms = [];
	},
	//default bindEvent of core
	_bindEvent = function(setting) {
		var o = setting.treeObj,
		c = consts.event;
		o.bind(c.NODECREATED, function (event, treeId, node) {
			tools.apply(setting.callback.onNodeCreated, [event, treeId, node]);
		});

		o.bind(c.CLICK, function (event, srcEvent, treeId, node, clickFlag) {
			tools.apply(setting.callback.onClick, [srcEvent, treeId, node, clickFlag]);
		});

		o.bind(c.EXPAND, function (event, treeId, node) {
			tools.apply(setting.callback.onExpand, [event, treeId, node]);
		});

		o.bind(c.COLLAPSE, function (event, treeId, node) {
			tools.apply(setting.callback.onCollapse, [event, treeId, node]);
		});

		o.bind(c.ASYNC_SUCCESS, function (event, treeId, node, msg) {
			tools.apply(setting.callback.onAsyncSuccess, [event, treeId, node, msg]);
		});

		o.bind(c.ASYNC_ERROR, function (event, treeId, node, XMLHttpRequest, textStatus, errorThrown) {
			tools.apply(setting.callback.onAsyncError, [event, treeId, node, XMLHttpRequest, textStatus, errorThrown]);
		});

		o.bind(c.REMOVE, function (event, treeId, treeNode) {
			tools.apply(setting.callback.onRemove, [event, treeId, treeNode]);
		});

		o.bind(c.SELECTED, function (event, treeId, node) {
			tools.apply(setting.callback.onSelected, [treeId, node]);
		});
		o.bind(c.UNSELECTED, function (event, treeId, node) {
			tools.apply(setting.callback.onUnSelected, [treeId, node]);
		});
	},
	_unbindEvent = function(setting) {
		var o = setting.treeObj,
		c = consts.event;
		o.unbind(c.NODECREATED)
		.unbind(c.CLICK)
		.unbind(c.EXPAND)
		.unbind(c.COLLAPSE)
		.unbind(c.ASYNC_SUCCESS)
		.unbind(c.ASYNC_ERROR)
		.unbind(c.REMOVE)
		.unbind(c.SELECTED)
		.unbind(c.UNSELECTED);
	},
	//default event proxy of core
	_eventProxy = function(event) {
		var target = event.target,
		setting = data.getSetting(event.data.treeId),
		tId = "", node = null,
		nodeEventType = "", treeEventType = "",
		nodeEventCallback = null, treeEventCallback = null,
		tmp = null;

		if (tools.eqs(event.type, "mousedown")) {
			treeEventType = "mousedown";
		} else if (tools.eqs(event.type, "mouseup")) {
			treeEventType = "mouseup";
		} else if (tools.eqs(event.type, "contextmenu")) {
			treeEventType = "contextmenu";
		} else if (tools.eqs(event.type, "click")) {
			if (tools.eqs(target.tagName, "span") && target.getAttribute("treeNode"+ consts.id.SWITCH) !== null) {
				tId = tools.getNodeMainDom(target).id;
				nodeEventType = "switchNode";
			} else {
				tmp = tools.getMDom(setting, target, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
				if (tmp) {
					tId = tools.getNodeMainDom(tmp).id;
					nodeEventType = "clickNode";
				}
			}
		} else if (tools.eqs(event.type, "dblclick")) {
			treeEventType = "dblclick";
			tmp = tools.getMDom(setting, target, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
			if (tmp) {
				tId = tools.getNodeMainDom(tmp).id;
				nodeEventType = "switchNode";
			}
		}
		if (treeEventType.length > 0 && tId.length == 0) {
			tmp = tools.getMDom(setting, target, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
			if (tmp) {tId = tools.getNodeMainDom(tmp).id;}
		}
		// event to node
		if (tId.length>0) {
			node = data.getNodeCache(setting, tId);
			switch (nodeEventType) {
				case "switchNode" :
					if (!node.isParent) {
						nodeEventType = "";
					} else if (tools.eqs(event.type, "click")
						|| (tools.eqs(event.type, "dblclick") && tools.apply(setting.view.dblClickExpand, [setting.treeId, node], setting.view.dblClickExpand))) {
						nodeEventCallback = handler.onSwitchNode;
					} else {
						nodeEventType = "";
					}
					break;
				case "clickNode" :
					nodeEventCallback = handler.onClickNode;
					break;
			}
		}
		// event to zTree
		switch (treeEventType) {
			case "mousedown" :
				treeEventCallback = handler.onZTreeMousedown;
				break;
			case "mouseup" :
				treeEventCallback = handler.onZTreeMouseup;
				break;
			case "dblclick" :
				treeEventCallback = handler.onZTreeDblclick;
				break;
			case "contextmenu" :
				treeEventCallback = handler.onZTreeContextmenu;
				break;
		}
		var proxyResult = {
			stop: false,
			node: node,
			nodeEventType: nodeEventType,
			nodeEventCallback: nodeEventCallback,
			treeEventType: treeEventType,
			treeEventCallback: treeEventCallback
		};
		return proxyResult
	},
	//default init node of core
	_initNode = function(setting, level, n, parentNode, isFirstNode, isLastNode, openFlag) {
		if (!n) return;
		var r = data.getRoot(setting),
		childKey = setting.data.key.children;
		n.level = level;
		n.tId = setting.treeId + "_" + (++r.zId);
		n.parentTId = parentNode ? parentNode.tId : null;
		n.open = (typeof n.open == "string") ? tools.eqs(n.open, "true") : !!n.open;
		if (n[childKey] && n[childKey].length > 0) {
			n.isParent = true;
			n.zAsync = true;
		} else {
			n.isParent = (typeof n.isParent == "string") ? tools.eqs(n.isParent, "true") : !!n.isParent;
			n.open = (n.isParent && !setting.async.enable) ? n.open : false;
			n.zAsync = !n.isParent;
		}
		n.isFirstNode = isFirstNode;
		n.isLastNode = isLastNode;
		n.getParentNode = function() {return data.getNodeCache(setting, n.parentTId);};
		n.getPreNode = function() {return data.getPreNode(setting, n);};
		n.getNextNode = function() {return data.getNextNode(setting, n);};
		n.getIndex = function() {return data.getNodeIndex(setting, n);};
		n.getPath = function() {return data.getNodePath(setting, n);};
		n.isAjaxing = false;
		data.fixPIdKeyValue(setting, n);
	},
	_init = {
		bind: [_bindEvent],
		unbind: [_unbindEvent],
		caches: [_initCache],
		nodes: [_initNode],
		proxys: [_eventProxy],
		roots: [_initRoot],
		beforeA: [],
		afterA: [],
		innerBeforeA: [],
		innerAfterA: [],
		zTreeTools: []
	},
	//method of operate data
	data = {
		addNodeCache: function(setting, node) {
			data.getCache(setting).nodes[data.getNodeCacheId(node.tId)] = node;
		},
		getNodeCacheId: function(tId) {
			return tId.substring(tId.lastIndexOf("_")+1);
		},
		addAfterA: function(afterA) {
			_init.afterA.push(afterA);
		},
		addBeforeA: function(beforeA) {
			_init.beforeA.push(beforeA);
		},
		addInnerAfterA: function(innerAfterA) {
			_init.innerAfterA.push(innerAfterA);
		},
		addInnerBeforeA: function(innerBeforeA) {
			_init.innerBeforeA.push(innerBeforeA);
		},
		addInitBind: function(bindEvent) {
			_init.bind.push(bindEvent);
		},
		addInitUnBind: function(unbindEvent) {
			_init.unbind.push(unbindEvent);
		},
		addInitCache: function(initCache) {
			_init.caches.push(initCache);
		},
		addInitNode: function(initNode) {
			_init.nodes.push(initNode);
		},
		addInitProxy: function(initProxy, isFirst) {
			if (!!isFirst) {
				_init.proxys.splice(0,0,initProxy);
			} else {
				_init.proxys.push(initProxy);
			}
		},
		addInitRoot: function(initRoot) {
			_init.roots.push(initRoot);
		},
		addNodesData: function(setting, parentNode, index, nodes) {
			var childKey = setting.data.key.children, params;
			if (!parentNode[childKey]) {
				parentNode[childKey] = [];
				index = -1;
			} else if (index >= parentNode[childKey].length) {
				index = -1;
			}

			if (parentNode[childKey].length > 0 && index === 0) {
				parentNode[childKey][0].isFirstNode = false;
				view.setNodeLineIcos(setting, parentNode[childKey][0]);
			} else if (parentNode[childKey].length > 0 && index < 0) {
				parentNode[childKey][parentNode[childKey].length - 1].isLastNode = false;
				view.setNodeLineIcos(setting, parentNode[childKey][parentNode[childKey].length - 1]);
			}
			parentNode.isParent = true;

			if (index<0) {
				parentNode[childKey] = parentNode[childKey].concat(nodes);
			} else {
				params = [index, 0].concat(nodes);
				parentNode[childKey].splice.apply(parentNode[childKey], params);
			}
		},
		addSelectedNode: function(setting, node) {
			var root = data.getRoot(setting);
			if (!data.isSelectedNode(setting, node)) {
				root.curSelectedList.push(node);
			}
		},
		addCreatedNode: function(setting, node) {
			if (!!setting.callback.onNodeCreated || !!setting.view.addDiyDom) {
				var root = data.getRoot(setting);
				root.createdNodes.push(node);
			}
		},
		addZTreeTools: function(zTreeTools) {
			_init.zTreeTools.push(zTreeTools);
		},
		exSetting: function(s) {
			$.extend(true, _setting, s);
		},
		fixPIdKeyValue: function(setting, node) {
			if (setting.data.simpleData.enable) {
				node[setting.data.simpleData.pIdKey] = node.parentTId ? node.getParentNode()[setting.data.simpleData.idKey] : setting.data.simpleData.rootPId;
			}
		},
		getAfterA: function(setting, node, array) {
			for (var i=0, j=_init.afterA.length; i<j; i++) {
				_init.afterA[i].apply(this, arguments);
			}
		},
		getBeforeA: function(setting, node, array) {
			for (var i=0, j=_init.beforeA.length; i<j; i++) {
				_init.beforeA[i].apply(this, arguments);
			}
		},
		getInnerAfterA: function(setting, node, array) {
			for (var i=0, j=_init.innerAfterA.length; i<j; i++) {
				_init.innerAfterA[i].apply(this, arguments);
			}
		},
		getInnerBeforeA: function(setting, node, array) {
			for (var i=0, j=_init.innerBeforeA.length; i<j; i++) {
				_init.innerBeforeA[i].apply(this, arguments);
			}
		},
		getCache: function(setting) {
			return caches[setting.treeId];
		},
		getNodeIndex: function(setting, node) {
			if (!node) return null;
			var childKey = setting.data.key.children,
			p = node.parentTId ? node.getParentNode() : data.getRoot(setting);
			for (var i=0, l=p[childKey].length-1; i<=l; i++) {
				if (p[childKey][i] === node) {
					return i;
				}
			}
			return -1;
		},
		getNextNode: function(setting, node) {
			if (!node) return null;
			var childKey = setting.data.key.children,
			p = node.parentTId ? node.getParentNode() : data.getRoot(setting);
			for (var i=0, l=p[childKey].length-1; i<=l; i++) {
				if (p[childKey][i] === node) {
					return (i==l ? null : p[childKey][i+1]);
				}
			}
			return null;
		},
		getNodeByParam: function(setting, nodes, key, value) {
			if (!nodes || !key) return null;
			var childKey = setting.data.key.children;
			for (var i = 0, l = nodes.length; i < l; i++) {
				if (nodes[i][key] == value) {
					return nodes[i];
				}
				var tmp = data.getNodeByParam(setting, nodes[i][childKey], key, value);
				if (tmp) return tmp;
			}
			return null;
		},
		getNodeCache: function(setting, tId) {
			if (!tId) return null;
			var n = caches[setting.treeId].nodes[data.getNodeCacheId(tId)];
			return n ? n : null;
		},
		getNodeName: function(setting, node) {
			var nameKey = setting.data.key.name;
			return "" + node[nameKey];
		},
		getNodeCount: function (setting, node) {
			var countKey = setting.data.key.count;
			return "" + node[countKey];
        },
		getNodePath: function(setting, node) {
			if (!node) return null;

			var path;
			if(node.parentTId) {
				path = node.getParentNode().getPath();
			} else {
				path = [];
			}

			if (path) {
				path.push(node);
			}

			return path;
		},
		getNodeTitle: function(setting, node) {
			var t = setting.data.key.title === "" ? setting.data.key.name : setting.data.key.title;
			return "" + node[t];
		},
		getNodes: function(setting) {
			return data.getRoot(setting)[setting.data.key.children];
		},
		getNodesByParam: function(setting, nodes, key, value) {
			if (!nodes || !key) return [];
			var childKey = setting.data.key.children,
			result = [];
			for (var i = 0, l = nodes.length; i < l; i++) {
				if (nodes[i][key] == value) {
					result.push(nodes[i]);
				}
				result = result.concat(data.getNodesByParam(setting, nodes[i][childKey], key, value));
			}
			return result;
		},
		getNodesByParamFuzzy: function(setting, nodes, key, value) {
			if (!nodes || !key) return [];
			var childKey = setting.data.key.children,
			result = [];
			value = value.toLowerCase();
			for (var i = 0, l = nodes.length; i < l; i++) {
				if (typeof nodes[i][key] == "string" && nodes[i][key].toLowerCase().indexOf(value)>-1) {
					result.push(nodes[i]);
				}
				result = result.concat(data.getNodesByParamFuzzy(setting, nodes[i][childKey], key, value));
			}
			return result;
		},
		getNodesByFilter: function(setting, nodes, filter, isSingle, invokeParam) {
			if (!nodes) return (isSingle ? null : []);
			var childKey = setting.data.key.children,
			result = isSingle ? null : [];
			for (var i = 0, l = nodes.length; i < l; i++) {
				if (tools.apply(filter, [nodes[i], invokeParam], false)) {
					if (isSingle) {return nodes[i];}
					result.push(nodes[i]);
				}
				var tmpResult = data.getNodesByFilter(setting, nodes[i][childKey], filter, isSingle, invokeParam);
				if (isSingle && !!tmpResult) {return tmpResult;}
				result = isSingle ? tmpResult : result.concat(tmpResult);
			}
			return result;
		},
		getPreNode: function(setting, node) {
			if (!node) return null;
			var childKey = setting.data.key.children,
			p = node.parentTId ? node.getParentNode() : data.getRoot(setting);
			for (var i=0, l=p[childKey].length; i<l; i++) {
				if (p[childKey][i] === node) {
					return (i==0 ? null : p[childKey][i-1]);
				}
			}
			return null;
		},
		getRoot: function(setting) {
			return setting ? roots[setting.treeId] : null;
		},
		getRoots: function() {
			return roots;
		},
		getSetting: function(treeId) {
			return settings[treeId];
		},
		getSettings: function() {
			return settings;
		},
		getZTreeTools: function(treeId) {
			var r = this.getRoot(this.getSetting(treeId));
			return r ? r.treeTools : null;
		},
		initCache: function(setting) {
			for (var i=0, j=_init.caches.length; i<j; i++) {
				_init.caches[i].apply(this, arguments);
			}
		},
		initNode: function(setting, level, node, parentNode, preNode, nextNode) {
			for (var i=0, j=_init.nodes.length; i<j; i++) {
				_init.nodes[i].apply(this, arguments);
			}
		},
		initRoot: function(setting) {
			for (var i=0, j=_init.roots.length; i<j; i++) {
				_init.roots[i].apply(this, arguments);
			}
		},
		isSelectedNode: function(setting, node) {
			var root = data.getRoot(setting);
			for (var i=0, j=root.curSelectedList.length; i<j; i++) {
				if(node === root.curSelectedList[i]) return true;
			}
			return false;
		},
		removeNodeCache: function(setting, node) {
			var childKey = setting.data.key.children;
			if (node[childKey]) {
				for (var i=0, l=node[childKey].length; i<l; i++) {
					data.removeNodeCache(setting, node[childKey][i]);
				}
			}
			data.getCache(setting).nodes[data.getNodeCacheId(node.tId)] = null;
		},
		removeSelectedNode: function(setting, node) {
			var root = data.getRoot(setting);
			for (var i=0, j=root.curSelectedList.length; i<j; i++) {
				if(node === root.curSelectedList[i] || !data.getNodeCache(setting, root.curSelectedList[i].tId)) {
					root.curSelectedList.splice(i, 1);
					setting.treeObj.trigger(consts.event.UNSELECTED, [setting.treeId, node]);
					i--;j--;
				}
			}
		},
		setCache: function(setting, cache) {
			caches[setting.treeId] = cache;
		},
		setRoot: function(setting, root) {
			roots[setting.treeId] = root;
		},
		setZTreeTools: function(setting, zTreeTools) {
			for (var i=0, j=_init.zTreeTools.length; i<j; i++) {
				_init.zTreeTools[i].apply(this, arguments);
			}
		},
		transformToArrayFormat: function (setting, nodes) {
			if (!nodes) return [];
			var childKey = setting.data.key.children,
			r = [];
			if (tools.isArray(nodes)) {
				for (var i=0, l=nodes.length; i<l; i++) {
					r.push(nodes[i]);
					if (nodes[i][childKey])
						r = r.concat(data.transformToArrayFormat(setting, nodes[i][childKey]));
				}
			} else {
				r.push(nodes);
				if (nodes[childKey])
					r = r.concat(data.transformToArrayFormat(setting, nodes[childKey]));
			}
			return r;
		},
		transformTozTreeFormat: function(setting, sNodes) {
			var i,l,
			key = setting.data.simpleData.idKey,
			parentKey = setting.data.simpleData.pIdKey,
			childKey = setting.data.key.children;
			if (!key || key=="" || !sNodes) return [];

			if (tools.isArray(sNodes)) {
				var r = [];
				var tmpMap = {};
				for (i=0, l=sNodes.length; i<l; i++) {
					tmpMap[sNodes[i][key]] = sNodes[i];
				}
				for (i=0, l=sNodes.length; i<l; i++) {
					if (tmpMap[sNodes[i][parentKey]] && sNodes[i][key] != sNodes[i][parentKey]) {
						if (!tmpMap[sNodes[i][parentKey]][childKey])
							tmpMap[sNodes[i][parentKey]][childKey] = [];
						tmpMap[sNodes[i][parentKey]][childKey].push(sNodes[i]);
					} else {
						r.push(sNodes[i]);
					}
				}
				return r;
			}else {
				return [sNodes];
			}
		}
	},
	//method of event proxy
	event = {
		bindEvent: function(setting) {
			for (var i=0, j=_init.bind.length; i<j; i++) {
				_init.bind[i].apply(this, arguments);
			}
		},
		unbindEvent: function(setting) {
			for (var i=0, j=_init.unbind.length; i<j; i++) {
				_init.unbind[i].apply(this, arguments);
			}
		},
		bindTree: function(setting) {
			var eventParam = {
				treeId: setting.treeId
			},
			o = setting.treeObj;
			if (!setting.view.txtSelectedEnable) {
				// for can't select text
				o.bind('selectstart', handler.onSelectStart).css({
					"-moz-user-select":"-moz-none"
				});
			}
			o.bind('click', eventParam, event.proxy);
			o.bind('dblclick', eventParam, event.proxy);
			o.bind('mouseover', eventParam, event.proxy);
			o.bind('mouseout', eventParam, event.proxy);
			o.bind('mousedown', eventParam, event.proxy);
			o.bind('mouseup', eventParam, event.proxy);
			o.bind('contextmenu', eventParam, event.proxy);
		},
		unbindTree: function(setting) {
			var o = setting.treeObj;
			o.unbind('selectstart', handler.onSelectStart)
				.unbind('click', event.proxy)
				.unbind('dblclick', event.proxy)
				.unbind('mouseover', event.proxy)
				.unbind('mouseout', event.proxy)
				.unbind('mousedown', event.proxy)
				.unbind('mouseup', event.proxy)
				.unbind('contextmenu', event.proxy);
		},
		doProxy: function(e) {
			var results = [];
			for (var i=0, j=_init.proxys.length; i<j; i++) {
				var proxyResult = _init.proxys[i].apply(this, arguments);
				results.push(proxyResult);
				if (proxyResult.stop) {
					break;
				}
			}
			return results;
		},
		proxy: function(e) {
			var setting = data.getSetting(e.data.treeId);
			if (!tools.uCanDo(setting, e)) return true;
			var results = event.doProxy(e),
			r = true, x = false;
			for (var i=0, l=results.length; i<l; i++) {
				var proxyResult = results[i];
				if (proxyResult.nodeEventCallback) {
					x = true;
					r = proxyResult.nodeEventCallback.apply(proxyResult, [e, proxyResult.node]) && r;
				}
				if (proxyResult.treeEventCallback) {
					x = true;
					r = proxyResult.treeEventCallback.apply(proxyResult, [e, proxyResult.node]) && r;
				}
			}
			return r;
		}
	},
	//method of event handler
	handler = {
		onSwitchNode: function (event, node) {
			var setting = data.getSetting(event.data.treeId);
			if (node.open) {
				if (tools.apply(setting.callback.beforeCollapse, [setting.treeId, node], true) == false) return true;
				data.getRoot(setting).expandTriggerFlag = true;
				view.switchNode(setting, node);
			} else {
				if (tools.apply(setting.callback.beforeExpand, [setting.treeId, node], true) == false) return true;
				data.getRoot(setting).expandTriggerFlag = true;
				view.switchNode(setting, node);
			}
			return true;
		},
		onClickNode: function (event, node) {
			var setting = data.getSetting(event.data.treeId),
			clickFlag = ( (setting.view.autoCancelSelected && (event.ctrlKey || event.metaKey)) && data.isSelectedNode(setting, node)) ? 0 : (setting.view.autoCancelSelected && (event.ctrlKey || event.metaKey) && setting.view.selectedMulti) ? 2 : 1;
			if (tools.apply(setting.callback.beforeClick, [setting.treeId, node, clickFlag], true) == false) return true;
			if (clickFlag === 0) {
				view.cancelPreSelectedNode(setting, node);
			} else {
				view.selectNode(setting, node, clickFlag === 2);
			}
			setting.treeObj.trigger(consts.event.CLICK, [event, setting.treeId, node, clickFlag]);
			return true;
		},
		onZTreeMousedown: function(event, node) {
			var setting = data.getSetting(event.data.treeId);
			if (tools.apply(setting.callback.beforeMouseDown, [setting.treeId, node], true)) {
				tools.apply(setting.callback.onMouseDown, [event, setting.treeId, node]);
			}
			return true;
		},
		onZTreeMouseup: function(event, node) {
			var setting = data.getSetting(event.data.treeId);
			if (tools.apply(setting.callback.beforeMouseUp, [setting.treeId, node], true)) {
				tools.apply(setting.callback.onMouseUp, [event, setting.treeId, node]);
			}
			return true;
		},
		onZTreeDblclick: function(event, node) {
			var setting = data.getSetting(event.data.treeId);
			if (tools.apply(setting.callback.beforeDblClick, [setting.treeId, node], true)) {
				tools.apply(setting.callback.onDblClick, [event, setting.treeId, node]);
			}
			return true;
		},
		onZTreeContextmenu: function(event, node) {
			var setting = data.getSetting(event.data.treeId);
			if (tools.apply(setting.callback.beforeRightClick, [setting.treeId, node], true)) {
				tools.apply(setting.callback.onRightClick, [event, setting.treeId, node]);
			}
			return (typeof setting.callback.onRightClick) !== "function";
		},
		onSelectStart: function(e){
			var n = e.originalEvent.srcElement.nodeName.toLowerCase();
			return (n === "input" || n === "textarea" );
		}
	},
	//method of tools for zTree
	tools = {
		apply: function(fun, param, defaultValue) {
			if ((typeof fun) === "function") {
				return fun.apply(zt, param?param:[]);
			}
			return defaultValue;
		},
		canAsync: function(setting, node) {
			var childKey = setting.data.key.children;
			return (setting.async.enable && node && node.isParent && !(node.zAsync || (node[childKey] && node[childKey].length > 0)));
		},
		clone: function (obj){
			if (obj === null) return null;
			var o = tools.isArray(obj) ? [] : {};
			for(var i in obj){
				o[i] = (obj[i] instanceof Date) ? new Date(obj[i].getTime()) : (typeof obj[i] === "object" ? tools.clone(obj[i]) : obj[i]);
			}
			return o;
		},
		eqs: function(str1, str2) {
			return str1.toLowerCase() === str2.toLowerCase();
		},
		isArray: function(arr) {
			return Object.prototype.toString.apply(arr) === "[object Array]";
		},
		$: function(node, exp, setting) {
			if (!!exp && typeof exp !== "string") {
				setting = exp;
				exp = "";
			}
			if (typeof node === "string") {
				return $(node, setting ? setting.treeObj.get(0).ownerDocument : null);
			} else {
				return $("#" + node.tId + exp, setting ? setting.treeObj : null);
			}
		},
		getMDom: function (setting, curDom, targetExpr) {
			if (!curDom) return null;
			while (curDom && curDom.id !== setting.treeId) {
				for (var i=0, l=targetExpr.length; curDom.tagName && i<l; i++) {
					if (tools.eqs(curDom.tagName, targetExpr[i].tagName) && curDom.getAttribute(targetExpr[i].attrName) !== null) {
						return curDom;
					}
				}
				curDom = curDom.parentNode;
			}
			return null;
		},
		getNodeMainDom:function(target) {
			return ($(target).parent("li").get(0) || $(target).parentsUntil("li").parent().get(0));
		},
		isChildOrSelf: function(dom, parentId) {
			return ( $(dom).closest("#" + parentId).length> 0 );
		},
		uCanDo: function(setting, e) {
			return true;
		}
	},
	//method of operate ztree dom
	view = {
		addNodes: function(setting, parentNode, index, newNodes, isSilent) {
			if (setting.data.keep.leaf && parentNode && !parentNode.isParent) {
				return;
			}
			if (!tools.isArray(newNodes)) {
				newNodes = [newNodes];
			}
			if (setting.data.simpleData.enable) {
				newNodes = data.transformTozTreeFormat(setting, newNodes);
			}
			if (parentNode) {
				var target_switchObj = $$(parentNode, consts.id.SWITCH, setting),
				target_icoObj = $$(parentNode, consts.id.ICON, setting),
				target_ulObj = $$(parentNode, consts.id.UL, setting);

				if (!parentNode.open) {
					view.replaceSwitchClass(parentNode, target_switchObj, consts.folder.CLOSE);
					view.replaceIcoClass(parentNode, target_icoObj, consts.folder.CLOSE);
					parentNode.open = false;
					target_ulObj.css({
						"display": "none"
					});
				}

				data.addNodesData(setting, parentNode, index, newNodes);
				view.createNodes(setting, parentNode.level + 1, newNodes, parentNode, index);
				if (!isSilent) {
					view.expandCollapseParentNode(setting, parentNode, true);
				}
			} else {
				data.addNodesData(setting, data.getRoot(setting), index, newNodes);
				view.createNodes(setting, 0, newNodes, null, index);
			}
		},
		appendNodes: function(setting, level, nodes, parentNode, index, initFlag, openFlag) {
			if (!nodes) return [];
			var html = [],
			childKey = setting.data.key.children;

			var tmpPNode = (parentNode) ? parentNode: data.getRoot(setting),
				tmpPChild = tmpPNode[childKey],
				isFirstNode, isLastNode;

			if (!tmpPChild || index >= tmpPChild.length) {
				index = -1;
			}

			for (var i = 0, l = nodes.length; i < l; i++) {
				var node = nodes[i];
				if (initFlag) {
					isFirstNode = ((index===0 || tmpPChild.length == nodes.length) && (i == 0));
					isLastNode = (index < 0 && i == (nodes.length - 1));
					data.initNode(setting, level, node, parentNode, isFirstNode, isLastNode, openFlag);
					data.addNodeCache(setting, node);
				}

				var childHtml = [];
				if (node[childKey] && node[childKey].length > 0) {
					//make child html first, because checkType
					childHtml = view.appendNodes(setting, level + 1, node[childKey], node, -1, initFlag, openFlag && node.open);
				}
				if (openFlag) {

					view.makeDOMNodeMainBefore(html, setting, node);
					view.makeDOMNodeLine(html, setting, node);
					data.getBeforeA(setting, node, html);
					view.makeDOMNodeNameBefore(html, setting, node);
					data.getInnerBeforeA(setting, node, html);
					view.makeDOMNodeIcon(html, setting, node);
					data.getInnerAfterA(setting, node, html);
					view.makeDOMNodeNameAfter(html, setting, node);
					data.getAfterA(setting, node, html);
					if (node.isParent && node.open) {
						view.makeUlHtml(setting, node, html, childHtml.join(''));
					}
					view.makeDOMNodeMainAfter(html, setting, node);
					data.addCreatedNode(setting, node);
				}
			}
			return html;
		},
		appendParentULDom: function(setting, node) {
			var html = [],
			nObj = $$(node, setting);
			if (!nObj.get(0) && !!node.parentTId) {
				view.appendParentULDom(setting, node.getParentNode());
				nObj = $$(node, setting);
			}
			var ulObj = $$(node, consts.id.UL, setting);
			if (ulObj.get(0)) {
				ulObj.remove();
			}
			var childKey = setting.data.key.children,
			childHtml = view.appendNodes(setting, node.level+1, node[childKey], node, -1, false, true);
			view.makeUlHtml(setting, node, html, childHtml.join(''));
			nObj.append(html.join(''));
		},
		asyncNode: function(setting, node, isSilent, callback) {
			var i, l;
			if (node && !node.isParent) {
				tools.apply(callback);
				return false;
			} else if (node && node.isAjaxing) {
				return false;
			} else if (tools.apply(setting.callback.beforeAsync, [setting.treeId, node], true) == false) {
				tools.apply(callback);
				return false;
			}
			if (node) {
				node.isAjaxing = true;
				var icoObj = $$(node, consts.id.ICON, setting);
				icoObj.attr({"style":"", "class":consts.className.BUTTON + " " + consts.className.ICO_LOADING});
			}

			var tmpParam = {};
			for (i = 0, l = setting.async.autoParam.length; node && i < l; i++) {
				var pKey = setting.async.autoParam[i].split("="), spKey = pKey;
				if (pKey.length>1) {
					spKey = pKey[1];
					pKey = pKey[0];
				}
				tmpParam[spKey] = node[pKey];
			}
			if (tools.isArray(setting.async.otherParam)) {
				for (i = 0, l = setting.async.otherParam.length; i < l; i += 2) {
					tmpParam[setting.async.otherParam[i]] = setting.async.otherParam[i + 1];
				}
			} else {
				for (var p in setting.async.otherParam) {
					tmpParam[p] = setting.async.otherParam[p];
				}
			}

			var _tmpV = data.getRoot(setting)._ver;
			$.ajax({
				contentType: setting.async.contentType,
                cache: false,
				type: setting.async.type,
				url: tools.apply(setting.async.url, [setting.treeId, node], setting.async.url),
				data: tmpParam,
				dataType: setting.async.dataType,
				complete:function(r){
					if (r.responseText.indexOf("<form id=\"loginForm") > 0) {
				        window.location.replace("/login?type=expired");
				        return;
					}				
				},				
				success: function(msg) {
					if (_tmpV != data.getRoot(setting)._ver) {
						return;
					}
					var newNodes = [];
					try {
						if (!msg || msg.length == 0) {
							newNodes = [];
						} else if (typeof msg == "string") {
							newNodes = eval("(" + msg + ")");
						} else {
							newNodes = msg;
						}
					} catch(err) {
						newNodes = msg;
					}

					if (node) {
						node.isAjaxing = null;
						node.zAsync = true;
					}
					view.setNodeLineIcos(setting, node);
					if (newNodes && newNodes !== "") {
						newNodes = tools.apply(setting.async.dataFilter, [setting.treeId, node, newNodes], newNodes);
						view.addNodes(setting, node, -1, !!newNodes ? tools.clone(newNodes) : [], !!isSilent);
					} else {
						view.addNodes(setting, node, -1, [], !!isSilent);
					}
					setting.treeObj.trigger(consts.event.ASYNC_SUCCESS, [setting.treeId, node, msg]);
					tools.apply(callback);
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					if (_tmpV != data.getRoot(setting)._ver) {
						return;
					}
					if (node) node.isAjaxing = null;
					view.setNodeLineIcos(setting, node);
					setting.treeObj.trigger(consts.event.ASYNC_ERROR, [setting.treeId, node, XMLHttpRequest, textStatus, errorThrown]);
				}
			});
			return true;
		},
		cancelPreSelectedNode: function (setting, node, excludeNode) {
			var list = data.getRoot(setting).curSelectedList,
				i, n;
			for (i=list.length-1; i>=0; i--) {
				n = list[i];
				if (node === n || (!node && (!excludeNode || excludeNode !== n))) {
					$$(n, consts.id.A, setting).removeClass(consts.node.CURSELECTED);
					if (node) {
						data.removeSelectedNode(setting, node);
						break;
					} else {
						list.splice(i, 1);
						setting.treeObj.trigger(consts.event.UNSELECTED, [setting.treeId, n]);
					}
				}
			}
		},
		createNodeCallback: function(setting) {
			if (!!setting.callback.onNodeCreated || !!setting.view.addDiyDom) {
				var root = data.getRoot(setting);
				while (root.createdNodes.length>0) {
					var node = root.createdNodes.shift();
					tools.apply(setting.view.addDiyDom, [setting.treeId, node]);
					if (!!setting.callback.onNodeCreated) {
						setting.treeObj.trigger(consts.event.NODECREATED, [setting.treeId, node]);
					}
				}
			}
		},
		createNodes: function(setting, level, nodes, parentNode, index) {
			if (!nodes || nodes.length == 0) return;
			var root = data.getRoot(setting),
			childKey = setting.data.key.children,
			openFlag = !parentNode || parentNode.open || !!$$(parentNode[childKey][0], setting).get(0);
			root.createdNodes = [];
			var zTreeHtml = view.appendNodes(setting, level, nodes, parentNode, index, true, openFlag),
				parentObj, nextObj;

			if (!parentNode) {
				parentObj = setting.treeObj;
				//setting.treeObj.append(zTreeHtml.join(''));
			} else {
				var ulObj = $$(parentNode, consts.id.UL, setting);
				if (ulObj.get(0)) {
					parentObj = ulObj;
					//ulObj.append(zTreeHtml.join(''));
				}
			}
			if (parentObj) {
				if (index >= 0) {
					nextObj = parentObj.children()[index];
				}
				if (index >=0 && nextObj) {
					$(nextObj).before(zTreeHtml.join(''));
				} else {
					parentObj.append(zTreeHtml.join(''));
				}
			}

			view.createNodeCallback(setting);
		},
		destroy: function(setting) {
			if (!setting) return;
			data.initCache(setting);
			data.initRoot(setting);
			event.unbindTree(setting);
			event.unbindEvent(setting);
			setting.treeObj.empty();
			delete settings[setting.treeId];
		},
		expandCollapseNode: function(setting, node, expandFlag, animateFlag, callback) {
			var root = data.getRoot(setting),
			childKey = setting.data.key.children;
			var tmpCb, _callback;
			if (!node) {
				tools.apply(callback, []);
				return;
			}
			if (root.expandTriggerFlag) {
				_callback = callback;
				tmpCb = function(){
					if (_callback) _callback();
					if (node.open) {
						setting.treeObj.trigger(consts.event.EXPAND, [setting.treeId, node]);
					} else {
						setting.treeObj.trigger(consts.event.COLLAPSE, [setting.treeId, node]);
					}
				};
				callback = tmpCb;
				root.expandTriggerFlag = false;
			}
			if (!node.open && node.isParent && ((!$$(node, consts.id.UL, setting).get(0)) || (node[childKey] && node[childKey].length>0 && !$$(node[childKey][0], setting).get(0)))) {
				view.appendParentULDom(setting, node);
				view.createNodeCallback(setting);
			}
			if (node.open == expandFlag) {
				tools.apply(callback, []);
				return;
			}
			var ulObj = $$(node, consts.id.UL, setting),
			switchObj = $$(node, consts.id.SWITCH, setting),
			icoObj = $$(node, consts.id.ICON, setting);

			if (node.isParent) {
				node.open = !node.open;
				if (node.iconOpen && node.iconClose) {
					icoObj.attr("style", view.makeNodeIcoStyle(setting, node));
				}

				if (node.open) {
					view.replaceSwitchClass(node, switchObj, consts.folder.OPEN);
					view.replaceIcoClass(node, icoObj, consts.folder.OPEN);
					if (animateFlag == false || setting.view.expandSpeed == "") {
						ulObj.show();
						tools.apply(callback, []);
					} else {
						if (node[childKey] && node[childKey].length > 0) {
							ulObj.slideDown(setting.view.expandSpeed, callback);
						} else {
							ulObj.show();
							tools.apply(callback, []);
						}
					}
				} else {
					view.replaceSwitchClass(node, switchObj, consts.folder.CLOSE);
					view.replaceIcoClass(node, icoObj, consts.folder.CLOSE);
					if (animateFlag == false || setting.view.expandSpeed == "" || !(node[childKey] && node[childKey].length > 0)) {
						ulObj.hide();
						tools.apply(callback, []);
					} else {
						ulObj.slideUp(setting.view.expandSpeed, callback);
					}
				}
			} else {
				tools.apply(callback, []);
			}
		},
		expandCollapseParentNode: function(setting, node, expandFlag, animateFlag, callback) {
			if (!node) return;
			if (!node.parentTId) {
				view.expandCollapseNode(setting, node, expandFlag, animateFlag, callback);
				return;
			} else {
				view.expandCollapseNode(setting, node, expandFlag, animateFlag);
			}
			if (node.parentTId) {
				view.expandCollapseParentNode(setting, node.getParentNode(), expandFlag, animateFlag, callback);
			}
		},
		expandCollapseSonNode: function(setting, node, expandFlag, animateFlag, callback) {
			var root = data.getRoot(setting),
			childKey = setting.data.key.children,
			treeNodes = (node) ? node[childKey]: root[childKey],
			selfAnimateSign = (node) ? false : animateFlag,
			expandTriggerFlag = data.getRoot(setting).expandTriggerFlag;
			data.getRoot(setting).expandTriggerFlag = false;
			if (treeNodes) {
				for (var i = 0, l = treeNodes.length; i < l; i++) {
					if (treeNodes[i]) view.expandCollapseSonNode(setting, treeNodes[i], expandFlag, selfAnimateSign);
				}
			}
			data.getRoot(setting).expandTriggerFlag = expandTriggerFlag;
			view.expandCollapseNode(setting, node, expandFlag, animateFlag, callback );
		},
		isSelectedNode: function (setting, node) {
			if (!node) {
				return false;
			}
			var list = data.getRoot(setting).curSelectedList,
				i;
			for (i=list.length-1; i>=0; i--) {
				if (node === list[i]) {
					return true;
				}
			}
			return false;
		},
		makeDOMNodeIcon: function(html, setting, node) {
			var nameStr = data.getNodeName(setting, node),
			countStr = data.getNodeCount(setting, node),
			name = setting.view.nameIsHTML ? nameStr : nameStr.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'),
			count = setting.view.countIsHTML ? countStr : countStr.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
			html.push("<span id='", node.tId, consts.id.ICON,
				"' title='' treeNode", consts.id.ICON," class='", view.makeNodeIcoClass(setting, node),
				"' style='", view.makeNodeIcoStyle(setting, node), "'></span><span id='", node.tId, consts.id.SPAN,
				"' class='", consts.className.NAME,
				"'>",name,"</span>");
			if (count !== "undefined") {
				html.push("<span id='", node.tId, consts.id.COUNT, "' class='", setting.view.countClass, "'>(", count, ")</span>");
            }
		},
		makeDOMNodeLine: function(html, setting, node) {
			if (node.type === 'vehicle') {
				html.push("<span id='", node.tId, consts.id.SWITCH,	"' title='' class='vehicle ", view.makeNodeLineClass(setting, node), "' treeNode", consts.id.SWITCH,"></span>");
			} else {
				html.push("<span id='", node.tId, consts.id.SWITCH,	"' title='' class='", view.makeNodeLineClass(setting, node), "' treeNode", consts.id.SWITCH,"></span>");
			}
		},
		makeDOMNodeMainAfter: function(html, setting, node) {
			html.push("</li>");
		},
		makeDOMNodeMainBefore: function(html, setting, node) {
			html.push("<li id='", node.tId, "' class='", consts.className.LEVEL, node.level,"' tabindex='0' hidefocus='true' treenode>");
		},
		makeDOMNodeNameAfter: function(html, setting, node) {
			html.push("</a>");
		},
		makeDOMNodeNameBefore: function(html, setting, node) {
			var title = data.getNodeTitle(setting, node),
			url = view.makeNodeUrl(setting, node),
			fontcss = view.makeNodeFontCss(setting, node),
			fontStyle = [];
			for (var f in fontcss) {
				fontStyle.push(f, ":", fontcss[f], ";");
			}
			html.push("<a id='", node.tId, consts.id.A, "' class='", consts.className.LEVEL, node.level,"' treeNode", consts.id.A," onclick=\"", (node.click || ''),
				"\" ", ((url != null && url.length > 0) ? "href='" + url + "'" : ""), " target='",view.makeNodeTarget(node),"' style='", fontStyle.join(''),
				"'");
			if (tools.apply(setting.view.showTitle, [setting.treeId, node], setting.view.showTitle) && title) {html.push("title='", title.replace(/'/g,"&#39;").replace(/</g,'&lt;').replace(/>/g,'&gt;'),"'");}
			html.push(">");
		},
		makeNodeFontCss: function(setting, node) {
			var fontCss = tools.apply(setting.view.fontCss, [setting.treeId, node], setting.view.fontCss);
			return (fontCss && ((typeof fontCss) != "function")) ? fontCss : {};
		},
		makeNodeIcoClass: function(setting, node) {
			var icoCss = ["ico"];
			if (!node.isAjaxing) {
				icoCss[0] = (node.iconSkin ? node.iconSkin + "_" : "") + icoCss[0];
				if (node.isParent) {
					icoCss.push(node.open ? consts.folder.OPEN : consts.folder.CLOSE);
				} else {
					icoCss.push(consts.folder.DOCU);
				}
			}
			return consts.className.BUTTON + " " + icoCss.join('_');
		},
		makeNodeIcoStyle: function(setting, node) {
			var icoStyle = [];
			if (!node.isAjaxing) {
				var icon = (node.isParent && node.iconOpen && node.iconClose) ? (node.open ? node.iconOpen : node.iconClose) : node[setting.data.key.icon];
				if (icon) icoStyle.push("background:url(", icon, ") 0 0 no-repeat;");
				if (setting.view.showIcon == false || !tools.apply(setting.view.showIcon, [setting.treeId, node], true)) {
					icoStyle.push("width:0px;height:0px;");
				}
			}
			return icoStyle.join('');
		},
		makeNodeLineClass: function(setting, node) {
			var lineClass = [];
			if (setting.view.showLine) {
				if (node.level == 0 && node.isFirstNode && node.isLastNode) {
					lineClass.push(consts.line.ROOT);
				} else if (node.level == 0 && node.isFirstNode) {
					lineClass.push(consts.line.ROOTS);
				} else if (node.isLastNode) {
					lineClass.push(consts.line.BOTTOM);
				} else {
					lineClass.push(consts.line.CENTER);
				}
			} else {
				lineClass.push(consts.line.NOLINE);
			}
			if (node.isParent) {
				lineClass.push(node.open ? consts.folder.OPEN : consts.folder.CLOSE);
			} else {
				lineClass.push(consts.folder.DOCU);
			}
			return view.makeNodeLineClassEx(node) + lineClass.join('_');
		},
		makeNodeLineClassEx: function(node) {
			return consts.className.BUTTON + " " + consts.className.LEVEL + node.level + " " + consts.className.SWITCH + " ";
		},
		makeNodeTarget: function(node) {
			return (node.target || "_blank");
		},
		makeNodeUrl: function(setting, node) {
			var urlKey = setting.data.key.url;
			return node[urlKey] ? node[urlKey] : null;
		},
		makeUlHtml: function(setting, node, html, content) {
			html.push("<ul id='", node.tId, consts.id.UL, "' class='", consts.className.LEVEL, node.level, " ", view.makeUlLineClass(setting, node), "' style='display:", (node.open ? "block": "none"),"'>");
			html.push(content);
			html.push("</ul>");
		},
		makeUlLineClass: function(setting, node) {
			return ((setting.view.showLine && !node.isLastNode) ? consts.line.LINE : "");
		},
		removeChildNodes: function(setting, node) {
			if (!node) return;
			var childKey = setting.data.key.children,
			nodes = node[childKey];
			if (!nodes) return;

			for (var i = 0, l = nodes.length; i < l; i++) {
				data.removeNodeCache(setting, nodes[i]);
			}
			data.removeSelectedNode(setting);
			delete node[childKey];

			if (!setting.data.keep.parent) {
				node.isParent = false;
				node.open = false;
				var tmp_switchObj = $$(node, consts.id.SWITCH, setting),
				tmp_icoObj = $$(node, consts.id.ICON, setting);
				view.replaceSwitchClass(node, tmp_switchObj, consts.folder.DOCU);
				view.replaceIcoClass(node, tmp_icoObj, consts.folder.DOCU);
				$$(node, consts.id.UL, setting).remove();
			} else {
				$$(node, consts.id.UL, setting).empty();
			}
		},
		scrollIntoView: function(dom) {
			if (!dom) {
				return;
			}
			if (dom.scrollIntoViewIfNeeded) {
				dom.scrollIntoViewIfNeeded();
			} else if (dom.scrollIntoView) {
				dom.scrollIntoView(false);
			} else {
				try{dom.focus().blur();}catch(e){}
			}
		},
		setFirstNode: function(setting, parentNode) {
			var childKey = setting.data.key.children, childLength = parentNode[childKey].length;
			if ( childLength > 0) {
				parentNode[childKey][0].isFirstNode = true;
			}
		},
		setLastNode: function(setting, parentNode) {
			var childKey = setting.data.key.children, childLength = parentNode[childKey].length;
			if ( childLength > 0) {
				parentNode[childKey][childLength - 1].isLastNode = true;
			}
		},
		removeNode: function(setting, node) {
			var root = data.getRoot(setting),
			childKey = setting.data.key.children,
			parentNode = (node.parentTId) ? node.getParentNode() : root;

			node.isFirstNode = false;
			node.isLastNode = false;
			node.getPreNode = function() {return null;};
			node.getNextNode = function() {return null;};

			if (!data.getNodeCache(setting, node.tId)) {
				return;
			}

			$$(node, setting).remove();
			data.removeNodeCache(setting, node);
			data.removeSelectedNode(setting, node);

			for (var i = 0, l = parentNode[childKey].length; i < l; i++) {
				if (parentNode[childKey][i].tId == node.tId) {
					parentNode[childKey].splice(i, 1);
					break;
				}
			}
			view.setFirstNode(setting, parentNode);
			view.setLastNode(setting, parentNode);

			var tmp_ulObj,tmp_switchObj,tmp_icoObj,
			childLength = parentNode[childKey].length;

			//repair nodes old parent
			if (!setting.data.keep.parent && childLength == 0) {
				//old parentNode has no child nodes
				parentNode.isParent = false;
				parentNode.open = false;
				tmp_ulObj = $$(parentNode, consts.id.UL, setting);
				tmp_switchObj = $$(parentNode, consts.id.SWITCH, setting);
				tmp_icoObj = $$(parentNode, consts.id.ICON, setting);
				view.replaceSwitchClass(parentNode, tmp_switchObj, consts.folder.DOCU);
				view.replaceIcoClass(parentNode, tmp_icoObj, consts.folder.DOCU);
				tmp_ulObj.css("display", "none");

			} else if (setting.view.showLine && childLength > 0) {
				//old parentNode has child nodes
				var newLast = parentNode[childKey][childLength - 1];
				tmp_ulObj = $$(newLast, consts.id.UL, setting);
				tmp_switchObj = $$(newLast, consts.id.SWITCH, setting);
				tmp_icoObj = $$(newLast, consts.id.ICON, setting);
				if (parentNode == root) {
					if (parentNode[childKey].length == 1) {
						//node was root, and ztree has only one root after move node
						view.replaceSwitchClass(newLast, tmp_switchObj, consts.line.ROOT);
					} else {
						var tmp_first_switchObj = $$(parentNode[childKey][0], consts.id.SWITCH, setting);
						view.replaceSwitchClass(parentNode[childKey][0], tmp_first_switchObj, consts.line.ROOTS);
						view.replaceSwitchClass(newLast, tmp_switchObj, consts.line.BOTTOM);
					}
				} else {
					view.replaceSwitchClass(newLast, tmp_switchObj, consts.line.BOTTOM);
				}
				tmp_ulObj.removeClass(consts.line.LINE);
			}
		},
		replaceIcoClass: function(node, obj, newName) {
			if (!obj || node.isAjaxing) return;
			var tmpName = obj.attr("class");
			if (tmpName == undefined) return;
			var tmpList = tmpName.split("_");
			switch (newName) {
				case consts.folder.OPEN:
				case consts.folder.CLOSE:
				case consts.folder.DOCU:
					tmpList[tmpList.length-1] = newName;
					break;
			}
			obj.attr("class", tmpList.join("_"));
		},
		replaceSwitchClass: function(node, obj, newName) {
			if (!obj) return;
			var tmpName = obj.attr("class");
			if (tmpName == undefined) return;
			var tmpList = tmpName.split("_");
			switch (newName) {
				case consts.line.ROOT:
				case consts.line.ROOTS:
				case consts.line.CENTER:
				case consts.line.BOTTOM:
				case consts.line.NOLINE:
					tmpList[0] = view.makeNodeLineClassEx(node) + newName;
					break;
				case consts.folder.OPEN:
				case consts.folder.CLOSE:
				case consts.folder.DOCU:
					tmpList[1] = newName;
					break;
			}
			obj.attr("class", tmpList.join("_"));
			if (newName !== consts.folder.DOCU) {
				obj.removeAttr("disabled");
			} else {
				obj.attr("disabled", "disabled");
			}
		},
		selectNode: function(setting, node, addFlag) {
			if (!addFlag) {
				view.cancelPreSelectedNode(setting, null, node);
			}
			$$(node, consts.id.A, setting).addClass(consts.node.CURSELECTED);
			data.addSelectedNode(setting, node);
			setting.treeObj.trigger(consts.event.SELECTED, [setting.treeId, node]);
		},
		setNodeFontCss: function(setting, treeNode) {
			var aObj = $$(treeNode, consts.id.A, setting),
			fontCss = view.makeNodeFontCss(setting, treeNode);
			if (fontCss) {
				aObj.css(fontCss);
			}
		},
		setNodeLineIcos: function(setting, node) {
			if (!node) return;
			var switchObj = $$(node, consts.id.SWITCH, setting),
			ulObj = $$(node, consts.id.UL, setting),
			icoObj = $$(node, consts.id.ICON, setting),
			ulLine = view.makeUlLineClass(setting, node);
			if (ulLine.length==0) {
				ulObj.removeClass(consts.line.LINE);
			} else {
				ulObj.addClass(ulLine);
			}
			if (node.type == 'vehicle') {
				switchObj.attr("class", 'vehicle ' + view.makeNodeLineClass(setting, node));
			} else {
				switchObj.attr("class", view.makeNodeLineClass(setting, node));
			}
			if (node.isParent) {
				switchObj.removeAttr("disabled");
			} else {
				switchObj.attr("disabled", "disabled");
			}
			icoObj.removeAttr("style");
			icoObj.attr("style", view.makeNodeIcoStyle(setting, node));
			icoObj.attr("class", view.makeNodeIcoClass(setting, node));
		},
		setNodeName: function(setting, node) {
			var title = data.getNodeTitle(setting, node),
			nObj = $$(node, consts.id.SPAN, setting);
			nObj.empty();
			if (setting.view.nameIsHTML) {
				nObj.html(data.getNodeName(setting, node));
			} else {
				nObj.text(data.getNodeName(setting, node));
			}
			if (tools.apply(setting.view.showTitle, [setting.treeId, node], setting.view.showTitle)) {
				var aObj = $$(node, consts.id.A, setting);
				aObj.attr("title", !title ? "" : title);
			}
		},
        setNodeNameCount: function(setting, node) {
            var title = data.getNodeTitle(setting, node),
                nObj = $$(node, consts.id.SPAN, setting),
                cObj = $$(node, consts.id.COUNT, setting);
            nObj.empty();
            if (setting.view.nameIsHTML) {
                nObj.html(data.getNodeName(setting, node));
            } else {
                nObj.text(data.getNodeName(setting, node));
            }
            if (cObj) {
                cObj.empty();
                var childKey = setting.data.key.children;
                if (!node[childKey]) {
                	return;
				}
                if (setting.view.countIsHTML) {
                    cObj.html("(" + node[childKey].length + ")");
                } else {
                    cObj.text("(" + node[childKey].length + ")");
                }
            }
            if (tools.apply(setting.view.showTitle, [setting.treeId, node], setting.view.showTitle)) {
                var aObj = $$(node, consts.id.A, setting);
                aObj.attr("title", !title ? "" : title);
            }
        },
		setNodeTarget: function(setting, node) {
			var aObj = $$(node, consts.id.A, setting);
			aObj.attr("target", view.makeNodeTarget(node));
		},
		setNodeUrl: function(setting, node) {
			var aObj = $$(node, consts.id.A, setting),
			url = view.makeNodeUrl(setting, node);
			if (url == null || url.length == 0) {
				aObj.removeAttr("href");
			} else {
				aObj.attr("href", url);
			}
		},
		switchNode: function(setting, node) {
			if (node.open || !tools.canAsync(setting, node)) {
				view.expandCollapseNode(setting, node, !node.open);
			} else if (setting.async.enable) {
				if (!view.asyncNode(setting, node)) {
					view.expandCollapseNode(setting, node, !node.open);
					return;
				}
			} else if (node) {
				view.expandCollapseNode(setting, node, !node.open);
			}
		}
	};
	// zTree defind
	$.fn.zTree = {
		consts : _consts,
		_z : {
			tools: tools,
			view: view,
			event: event,
			data: data
		},
		getZTreeObj: function(treeId) {
			var o = data.getZTreeTools(treeId);
			return o ? o : null;
		},
		destroy: function(treeId) {
			if (!!treeId && treeId.length > 0) {
				view.destroy(data.getSetting(treeId));
			} else {
				for(var s in settings) {
					view.destroy(settings[s]);
				}
			}
		},
		init: function(obj, zSetting, zNodes) {
			var setting = tools.clone(_setting);
			$.extend(true, setting, zSetting);
			setting.treeId = obj.attr("id");
			setting.treeObj = obj;
			setting.treeObj.empty();
			settings[setting.treeId] = setting;
			//For some older browser,(e.g., ie6)
			if(typeof document.body.style.maxHeight === "undefined") {
				setting.view.expandSpeed = "";
			}
			data.initRoot(setting);
			var root = data.getRoot(setting),
			childKey = setting.data.key.children;
			zNodes = zNodes ? tools.clone(tools.isArray(zNodes)? zNodes : [zNodes]) : [];
			if (setting.data.simpleData.enable) {
				root[childKey] = data.transformTozTreeFormat(setting, zNodes);
			} else {
				root[childKey] = zNodes;
			}

			data.initCache(setting);
			event.unbindTree(setting);
			event.bindTree(setting);
			event.unbindEvent(setting);
			event.bindEvent(setting);

			var zTreeTools = {
				setting : setting,
				addNodes : function(parentNode, index, newNodes, isSilent) {
					if (!parentNode) parentNode = null;
					if (parentNode && !parentNode.isParent && setting.data.keep.leaf) return null;

					var i = parseInt(index, 10);
					if (isNaN(i)) {
						isSilent = !!newNodes;
						newNodes = index;
						index = -1;
					} else {
						index = i;
					}
					if (!newNodes) return null;


					var xNewNodes = tools.clone(tools.isArray(newNodes)? newNodes: [newNodes]);
					function addCallback() {
						view.addNodes(setting, parentNode, index, xNewNodes, (isSilent==true));
					}

					if (tools.canAsync(setting, parentNode)) {
						view.asyncNode(setting, parentNode, isSilent, addCallback);
					} else {
						addCallback();
					}
					return xNewNodes;
				},
				cancelSelectedNode : function(node) {
					view.cancelPreSelectedNode(setting, node);
				},
				destroy : function() {
					view.destroy(setting);
				},
				expandAll : function(expandFlag) {
					expandFlag = !!expandFlag;
					view.expandCollapseSonNode(setting, null, expandFlag, true);
					return expandFlag;
				},
				expandNode : function(node, expandFlag, sonSign, focus, callbackFlag) {
					if (!node || !node.isParent) return null;
					if (expandFlag !== true && expandFlag !== false) {
						expandFlag = !node.open;
					}
					callbackFlag = !!callbackFlag;

					if (callbackFlag && expandFlag && (tools.apply(setting.callback.beforeExpand, [setting.treeId, node], true) == false)) {
						return null;
					} else if (callbackFlag && !expandFlag && (tools.apply(setting.callback.beforeCollapse, [setting.treeId, node], true) == false)) {
						return null;
					}
					if (expandFlag && node.parentTId) {
						view.expandCollapseParentNode(setting, node.getParentNode(), expandFlag, false);
					}
					if (expandFlag === node.open && !sonSign) {
						return null;
					}

					data.getRoot(setting).expandTriggerFlag = callbackFlag;
					if (!tools.canAsync(setting, node) && sonSign) {
						view.expandCollapseSonNode(setting, node, expandFlag, true, showNodeFocus);
					} else {
						node.open = !expandFlag;
						view.switchNode(this.setting, node);
						showNodeFocus();
					}
					return expandFlag;

					function showNodeFocus() {
						var a = $$(node, setting).get(0);
						if (a && focus !== false) {
							view.scrollIntoView(a);
						}
					}
				},
				getNodes : function() {
					return data.getNodes(setting);
				},
				getNodeByParam : function(key, value, parentNode) {
					if (!key) return null;
					return data.getNodeByParam(setting, parentNode?parentNode[setting.data.key.children]:data.getNodes(setting), key, value);
				},
				getNodeByTId : function(tId) {
					return data.getNodeCache(setting, tId);
				},
				getNodesByParam : function(key, value, parentNode) {
					if (!key) return null;
					return data.getNodesByParam(setting, parentNode?parentNode[setting.data.key.children]:data.getNodes(setting), key, value);
				},
				getNodesByParamFuzzy : function(key, value, parentNode) {
					if (!key) return null;
					return data.getNodesByParamFuzzy(setting, parentNode?parentNode[setting.data.key.children]:data.getNodes(setting), key, value);
				},
				getNodesByFilter: function(filter, isSingle, parentNode, invokeParam) {
					isSingle = !!isSingle;
					if (!filter || (typeof filter != "function")) return (isSingle ? null : []);
					return data.getNodesByFilter(setting, parentNode?parentNode[setting.data.key.children]:data.getNodes(setting), filter, isSingle, invokeParam);
				},
				getNodeIndex : function(node) {
					if (!node) return null;
					var childKey = setting.data.key.children,
					parentNode = (node.parentTId) ? node.getParentNode() : data.getRoot(setting);
					for (var i=0, l = parentNode[childKey].length; i < l; i++) {
						if (parentNode[childKey][i] == node) return i;
					}
					return -1;
				},
				getSelectedNodes : function() {
					var r = [], list = data.getRoot(setting).curSelectedList;
					for (var i=0, l=list.length; i<l; i++) {
						r.push(list[i]);
					}
					return r;
				},
				isSelectedNode : function(node) {
					return data.isSelectedNode(setting, node);
				},
				reAsyncChildNodes : function(parentNode, reloadType, isSilent) {
					if (!this.setting.async.enable) return;
					var isRoot = !parentNode;
					if (isRoot) {
						parentNode = data.getRoot(setting);
					}
					if (reloadType=="refresh") {
						var childKey = this.setting.data.key.children;
						for (var i = 0, l = parentNode[childKey] ? parentNode[childKey].length : 0; i < l; i++) {
							data.removeNodeCache(setting, parentNode[childKey][i]);
						}
						data.removeSelectedNode(setting);
						parentNode[childKey] = [];
						if (isRoot) {
							this.setting.treeObj.empty();
						} else {
							var ulObj = $$(parentNode, consts.id.UL, setting);
							ulObj.empty();
						}
					}
					view.asyncNode(this.setting, isRoot? null:parentNode, !!isSilent);
				},
				refresh : function() {
					this.setting.treeObj.empty();
					var root = data.getRoot(setting),
					nodes = root[setting.data.key.children]
					data.initRoot(setting);
					root[setting.data.key.children] = nodes
					data.initCache(setting);
					view.createNodes(setting, 0, root[setting.data.key.children], null, -1);
				},
				removeChildNodes : function(node) {
					if (!node) return null;
					var childKey = setting.data.key.children,
					nodes = node[childKey];
					view.removeChildNodes(setting, node);
					return nodes ? nodes : null;
				},
				removeNode : function(node, callbackFlag) {
					if (!node) return;
					callbackFlag = !!callbackFlag;
					if (callbackFlag && tools.apply(setting.callback.beforeRemove, [setting.treeId, node], true) == false) return;
					view.removeNode(setting, node);
					if (callbackFlag) {
						this.setting.treeObj.trigger(consts.event.REMOVE, [setting.treeId, node]);
					}
				},
				selectNode : function(node, addFlag, isSilent) {
					if (!node) return;
					if (tools.uCanDo(setting)) {
						addFlag = setting.view.selectedMulti && addFlag;
						if (node.parentTId) {
							view.expandCollapseParentNode(setting, node.getParentNode(), true, false, showNodeFocus);
						} else if (!isSilent) {
							try{$$(node, setting).focus().blur();}catch(e){}
						}
						view.selectNode(setting, node, addFlag);
					}

					function showNodeFocus() {
						if (isSilent) {
							return;
						}
						var a = $$(node, setting).get(0);
						view.scrollIntoView(a);
					}
				},
				transformTozTreeNodes : function(simpleNodes) {
					return data.transformTozTreeFormat(setting, simpleNodes);
				},
				transformToArray : function(nodes) {
					return data.transformToArrayFormat(setting, nodes);
				},
				updateNode : function(node, checkTypeFlag) {
					if (!node) return;
					var nObj = $$(node, setting);
					if (nObj.get(0) && tools.uCanDo(setting)) {
						view.setNodeName(setting, node);
						view.setNodeTarget(setting, node);
						view.setNodeUrl(setting, node);
						view.setNodeLineIcos(setting, node);
						view.setNodeFontCss(setting, node);
					}
				},
                updateNodeCount : function(node, checkTypeFlag) {
                    if (!node) return;
                    var nObj = $$(node, setting);
                    if (nObj.get(0) && tools.uCanDo(setting)) {
                        view.setNodeNameCount(setting, node);
                        view.setNodeTarget(setting, node);
                        view.setNodeUrl(setting, node);
                        view.setNodeLineIcos(setting, node);
                        view.setNodeFontCss(setting, node);
                    }
                }
			}
			root.treeTools = zTreeTools;
			data.setZTreeTools(setting, zTreeTools);

			if (root[childKey] && root[childKey].length > 0) {
				view.createNodes(setting, 0, root[childKey], null, -1);
			} else if (setting.async.enable && setting.async.url && setting.async.url !== '') {
				view.asyncNode(setting);
			}
			return zTreeTools;
		}
	};

	var zt = $.fn.zTree,
	$$ = tools.$,
	consts = zt.consts;
})(jQuery);
/*
 * JQuery zTree excheck v3.5.24
 * http://zTree.me/
 *
 * Copyright (c) 2010 Hunter.z
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: hunter.z@263.net
 * Date: 2016-06-06
 */
(function($){
	//default consts of excheck
	var _consts = {
		event: {
			CHECK: "ztree_check"
		},
		id: {
			CHECK: "_check"
		},
		checkbox: {
			STYLE: "checkbox",
			DEFAULT: "chk",
			DISABLED: "disable",
			FALSE: "false",
			TRUE: "true",
			FULL: "full",
			PART: "part",
			FOCUS: "focus"
		},
		radio: {
			STYLE: "radio",
			TYPE_ALL: "all",
			TYPE_LEVEL: "level"
		}
	},
	//default setting of excheck
	_setting = {
		check: {
			enable: false,
			autoCheckTrigger: false,
			chkStyle: _consts.checkbox.STYLE,
			nocheckInherit: false,
			chkDisabledInherit: false,
			radioType: _consts.radio.TYPE_LEVEL,
			chkboxType: {
				"Y": "ps",
				"N": "ps"
			}
		},
		data: {
			key: {
				checked: "checked"
			}
		},
		callback: {
			beforeCheck:null,
			onCheck:null
		}
	},
	//default root of excheck
	_initRoot = function (setting) {
		var r = data.getRoot(setting);
		r.radioCheckedList = [];
	},
	//default cache of excheck
	_initCache = function(treeId) {},
	//default bind event of excheck
	_bindEvent = function(setting) {
		var o = setting.treeObj,
		c = consts.event;
		o.bind(c.CHECK, function (event, srcEvent, treeId, node) {
			event.srcEvent = srcEvent;
			tools.apply(setting.callback.onCheck, [event, treeId, node]);
		});
	},
	_unbindEvent = function(setting) {
		var o = setting.treeObj,
		c = consts.event;
		o.unbind(c.CHECK);
	},
	//default event proxy of excheck
	_eventProxy = function(e) {
		var target = e.target,
		setting = data.getSetting(e.data.treeId),
		tId = "", node = null,
		nodeEventType = "", treeEventType = "",
		nodeEventCallback = null, treeEventCallback = null;

		if (tools.eqs(e.type, "mouseover")) {
			if (setting.check.enable && tools.eqs(target.tagName, "span") && target.getAttribute("treeNode"+ consts.id.CHECK) !== null) {
				tId = tools.getNodeMainDom(target).id;
				nodeEventType = "mouseoverCheck";
			}
		} else if (tools.eqs(e.type, "mouseout")) {
			if (setting.check.enable && tools.eqs(target.tagName, "span") && target.getAttribute("treeNode"+ consts.id.CHECK) !== null) {
				tId = tools.getNodeMainDom(target).id;
				nodeEventType = "mouseoutCheck";
			}
		} else if (tools.eqs(e.type, "click")) {
			if (setting.check.enable && tools.eqs(target.tagName, "span") && target.getAttribute("treeNode"+ consts.id.CHECK) !== null) {
				tId = tools.getNodeMainDom(target).id;
				nodeEventType = "checkNode";
			}
		}
		if (tId.length>0) {
			node = data.getNodeCache(setting, tId);
			switch (nodeEventType) {
				case "checkNode" :
					nodeEventCallback = _handler.onCheckNode;
					break;
				case "mouseoverCheck" :
					nodeEventCallback = _handler.onMouseoverCheck;
					break;
				case "mouseoutCheck" :
					nodeEventCallback = _handler.onMouseoutCheck;
					break;
			}
		}
		var proxyResult = {
			stop: nodeEventType === "checkNode",
			node: node,
			nodeEventType: nodeEventType,
			nodeEventCallback: nodeEventCallback,
			treeEventType: treeEventType,
			treeEventCallback: treeEventCallback
		};
		return proxyResult
	},
	//default init node of excheck
	_initNode = function(setting, level, n, parentNode, isFirstNode, isLastNode, openFlag) {
		if (!n) return;
		var checkedKey = setting.data.key.checked;
		if (typeof n[checkedKey] == "string") n[checkedKey] = tools.eqs(n[checkedKey], "true");
		n[checkedKey] = !!n[checkedKey];
		n.checkedOld = n[checkedKey];
		if (typeof n.nocheck == "string") n.nocheck = tools.eqs(n.nocheck, "true");
		n.nocheck = !!n.nocheck || (setting.check.nocheckInherit && parentNode && !!parentNode.nocheck);
		if (typeof n.chkDisabled == "string") n.chkDisabled = tools.eqs(n.chkDisabled, "true");
		n.chkDisabled = !!n.chkDisabled || (setting.check.chkDisabledInherit && parentNode && !!parentNode.chkDisabled);
		if (typeof n.halfCheck == "string") n.halfCheck = tools.eqs(n.halfCheck, "true");
		n.halfCheck = !!n.halfCheck;
		n.check_Child_State = -1;
		n.check_Focus = false;
		n.getCheckStatus = function() {return data.getCheckStatus(setting, n);};

		if (setting.check.chkStyle == consts.radio.STYLE && setting.check.radioType == consts.radio.TYPE_ALL && n[checkedKey] ) {
			var r = data.getRoot(setting);
			r.radioCheckedList.push(n);
		}
	},
	//add dom for check
	_beforeA = function(setting, node, html) {
		var checkedKey = setting.data.key.checked;
		if (setting.check.enable) {
			data.makeChkFlag(setting, node);
			html.push("<span ID='", node.tId, consts.id.CHECK, "' class='", view.makeChkClass(setting, node), "' treeNode", consts.id.CHECK, (node.nocheck === true?" style='display:none;'":""),"></span>");
		}
	},
	//update zTreeObj, add method of check
	_zTreeTools = function(setting, zTreeTools) {
		zTreeTools.checkNode = function(node, checked, checkTypeFlag, callbackFlag) {
			var checkedKey = this.setting.data.key.checked;
			if (node.chkDisabled === true) return;
			if (checked !== true && checked !== false) {
				checked = !node[checkedKey];
			}
			callbackFlag = !!callbackFlag;

			if (node[checkedKey] === checked && !checkTypeFlag) {
				return;
			} else if (callbackFlag && tools.apply(this.setting.callback.beforeCheck, [this.setting.treeId, node], true) == false) {
				return;
			}
			if (tools.uCanDo(this.setting) && this.setting.check.enable && node.nocheck !== true) {
				node[checkedKey] = checked;
				var checkObj = $$(node, consts.id.CHECK, this.setting);
				if (checkTypeFlag || this.setting.check.chkStyle === consts.radio.STYLE) view.checkNodeRelation(this.setting, node);
				view.setChkClass(this.setting, checkObj, node);
				view.repairParentChkClassWithSelf(this.setting, node);
				if (callbackFlag) {
					this.setting.treeObj.trigger(consts.event.CHECK, [null, this.setting.treeId, node]);
				}
			}
		}

		zTreeTools.checkAllNodes = function(checked) {
			view.repairAllChk(this.setting, !!checked);
		}

		zTreeTools.getCheckedNodes = function(checked) {
			var childKey = this.setting.data.key.children;
			checked = (checked !== false);
			return data.getTreeCheckedNodes(this.setting, data.getRoot(this.setting)[childKey], checked);
		}

		zTreeTools.getChangeCheckedNodes = function() {
			var childKey = this.setting.data.key.children;
			return data.getTreeChangeCheckedNodes(this.setting, data.getRoot(this.setting)[childKey]);
		}

		zTreeTools.setChkDisabled = function(node, disabled, inheritParent, inheritChildren) {
			disabled = !!disabled;
			inheritParent = !!inheritParent;
			inheritChildren = !!inheritChildren;
			view.repairSonChkDisabled(this.setting, node, disabled, inheritChildren);
			view.repairParentChkDisabled(this.setting, node.getParentNode(), disabled, inheritParent);
		}

		var _updateNode = zTreeTools.updateNode;
		zTreeTools.updateNode = function(node, checkTypeFlag) {
			if (_updateNode) _updateNode.apply(zTreeTools, arguments);
			if (!node || !this.setting.check.enable) return;
			var nObj = $$(node, this.setting);
			if (nObj.get(0) && tools.uCanDo(this.setting)) {
				var checkObj = $$(node, consts.id.CHECK, this.setting);
				if (checkTypeFlag == true || this.setting.check.chkStyle === consts.radio.STYLE) view.checkNodeRelation(this.setting, node);
				view.setChkClass(this.setting, checkObj, node);
				view.repairParentChkClassWithSelf(this.setting, node);
			}
		}
	},
	//method of operate data
	_data = {
		getRadioCheckedList: function(setting) {
			var checkedList = data.getRoot(setting).radioCheckedList;
			for (var i=0, j=checkedList.length; i<j; i++) {
				if(!data.getNodeCache(setting, checkedList[i].tId)) {
					checkedList.splice(i, 1);
					i--; j--;
				}
			}
			return checkedList;
		},
		getCheckStatus: function(setting, node) {
			if (!setting.check.enable || node.nocheck || node.chkDisabled) return null;
			var checkedKey = setting.data.key.checked,
			r = {
				checked: node[checkedKey],
				half: node.halfCheck ? node.halfCheck : (setting.check.chkStyle == consts.radio.STYLE ? (node.check_Child_State === 2) : (node[checkedKey] ? (node.check_Child_State > -1 && node.check_Child_State < 2) : (node.check_Child_State > 0)))
			};
			return r;
		},
		getTreeCheckedNodes: function(setting, nodes, checked, results) {
			if (!nodes) return [];
			var childKey = setting.data.key.children,
			checkedKey = setting.data.key.checked,
			onlyOne = (checked && setting.check.chkStyle == consts.radio.STYLE && setting.check.radioType == consts.radio.TYPE_ALL);
			results = !results ? [] : results;
			for (var i = 0, l = nodes.length; i < l; i++) {
				if (nodes[i].nocheck !== true && nodes[i].chkDisabled !== true && nodes[i][checkedKey] == checked) {
					results.push(nodes[i]);
					if(onlyOne) {
						break;
					}
				}
				data.getTreeCheckedNodes(setting, nodes[i][childKey], checked, results);
				if(onlyOne && results.length > 0) {
					break;
				}
			}
			return results;
		},
		getTreeChangeCheckedNodes: function(setting, nodes, results) {
			if (!nodes) return [];
			var childKey = setting.data.key.children,
			checkedKey = setting.data.key.checked;
			results = !results ? [] : results;
			for (var i = 0, l = nodes.length; i < l; i++) {
				if (nodes[i].nocheck !== true && nodes[i].chkDisabled !== true && nodes[i][checkedKey] != nodes[i].checkedOld) {
					results.push(nodes[i]);
				}
				data.getTreeChangeCheckedNodes(setting, nodes[i][childKey], results);
			}
			return results;
		},
		makeChkFlag: function(setting, node) {
			if (!node) return;
			var childKey = setting.data.key.children,
			checkedKey = setting.data.key.checked,
			chkFlag = -1;
			if (node[childKey]) {
				for (var i = 0, l = node[childKey].length; i < l; i++) {
					var cNode = node[childKey][i];
					var tmp = -1;
					if (setting.check.chkStyle == consts.radio.STYLE) {
						if (cNode.nocheck === true || cNode.chkDisabled === true) {
							tmp = cNode.check_Child_State;
						} else if (cNode.halfCheck === true) {
							tmp = 2;
						} else if (cNode[checkedKey]) {
							tmp = 2;
						} else {
							tmp = cNode.check_Child_State > 0 ? 2:0;
						}
						if (tmp == 2) {
							chkFlag = 2; break;
						} else if (tmp == 0){
							chkFlag = 0;
						}
					} else if (setting.check.chkStyle == consts.checkbox.STYLE) {
						if (cNode.nocheck === true || cNode.chkDisabled === true) {
							tmp = cNode.check_Child_State;
						} else if (cNode.halfCheck === true) {
							tmp = 1;
						} else if (cNode[checkedKey] ) {
							tmp = (cNode.check_Child_State === -1 || cNode.check_Child_State === 2) ? 2 : 1;
						} else {
							tmp = (cNode.check_Child_State > 0) ? 1 : 0;
						}
						if (tmp === 1) {
							chkFlag = 1; break;
						} else if (tmp === 2 && chkFlag > -1 && i > 0 && tmp !== chkFlag) {
							chkFlag = 1; break;
						} else if (chkFlag === 2 && tmp > -1 && tmp < 2) {
							chkFlag = 1; break;
						} else if (tmp > -1) {
							chkFlag = tmp;
						}
					}
				}
			}
			node.check_Child_State = chkFlag;
		}
	},
	//method of event proxy
	_event = {

	},
	//method of event handler
	_handler = {
		onCheckNode: function (event, node) {
			if (node.chkDisabled === true) return false;
			var setting = data.getSetting(event.data.treeId),
			checkedKey = setting.data.key.checked;
			if (tools.apply(setting.callback.beforeCheck, [setting.treeId, node], true) == false) return true;
			node[checkedKey] = !node[checkedKey];
			view.checkNodeRelation(setting, node);
			var checkObj = $$(node, consts.id.CHECK, setting);
			view.setChkClass(setting, checkObj, node);
			view.repairParentChkClassWithSelf(setting, node);
			setting.treeObj.trigger(consts.event.CHECK, [event, setting.treeId, node]);
			return true;
		},
		onMouseoverCheck: function(event, node) {
			if (node.chkDisabled === true) return false;
			var setting = data.getSetting(event.data.treeId),
			checkObj = $$(node, consts.id.CHECK, setting);
			node.check_Focus = true;
			view.setChkClass(setting, checkObj, node);
			return true;
		},
		onMouseoutCheck: function(event, node) {
			if (node.chkDisabled === true) return false;
			var setting = data.getSetting(event.data.treeId),
			checkObj = $$(node, consts.id.CHECK, setting);
			node.check_Focus = false;
			view.setChkClass(setting, checkObj, node);
			return true;
		}
	},
	//method of tools for zTree
	_tools = {

	},
	//method of operate ztree dom
	_view = {
		checkNodeRelation: function(setting, node) {
			var pNode, i, l,
			childKey = setting.data.key.children,
			checkedKey = setting.data.key.checked,
			r = consts.radio;
			if (setting.check.chkStyle == r.STYLE) {
				var checkedList = data.getRadioCheckedList(setting);
				if (node[checkedKey]) {
					if (setting.check.radioType == r.TYPE_ALL) {
						for (i = checkedList.length-1; i >= 0; i--) {
							pNode = checkedList[i];
							if (pNode[checkedKey] && pNode != node) {
								pNode[checkedKey] = false;
								checkedList.splice(i, 1);

								view.setChkClass(setting, $$(pNode, consts.id.CHECK, setting), pNode);
								if (pNode.parentTId != node.parentTId) {
									view.repairParentChkClassWithSelf(setting, pNode);
								}
							}
						}
						checkedList.push(node);
					} else {
						var parentNode = (node.parentTId) ? node.getParentNode() : data.getRoot(setting);
						for (i = 0, l = parentNode[childKey].length; i < l; i++) {
							pNode = parentNode[childKey][i];
							if (pNode[checkedKey] && pNode != node) {
								pNode[checkedKey] = false;
								view.setChkClass(setting, $$(pNode, consts.id.CHECK, setting), pNode);
							}
						}
					}
				} else if (setting.check.radioType == r.TYPE_ALL) {
					for (i = 0, l = checkedList.length; i < l; i++) {
						if (node == checkedList[i]) {
							checkedList.splice(i, 1);
							break;
						}
					}
				}

			} else {
				if (node[checkedKey] && (!node[childKey] || node[childKey].length==0 || setting.check.chkboxType.Y.indexOf("s") > -1)) {
					view.setSonNodeCheckBox(setting, node, true);
				}
				if (!node[checkedKey] && (!node[childKey] || node[childKey].length==0 || setting.check.chkboxType.N.indexOf("s") > -1)) {
					view.setSonNodeCheckBox(setting, node, false);
				}
				if (node[checkedKey] && setting.check.chkboxType.Y.indexOf("p") > -1) {
					view.setParentNodeCheckBox(setting, node, true);
				}
				if (!node[checkedKey] && setting.check.chkboxType.N.indexOf("p") > -1) {
					view.setParentNodeCheckBox(setting, node, false);
				}
			}
		},
		makeChkClass: function(setting, node) {
			var checkedKey = setting.data.key.checked,
			c = consts.checkbox, r = consts.radio,
			fullStyle = "";
			if (node.chkDisabled === true) {
				fullStyle = c.DISABLED;
			} else if (node.halfCheck) {
				fullStyle = c.PART;
			} else if (setting.check.chkStyle == r.STYLE) {
				fullStyle = (node.check_Child_State < 1)? c.FULL:c.PART;
			} else {
				fullStyle = node[checkedKey] ? ((node.check_Child_State === 2 || node.check_Child_State === -1) ? c.FULL:c.PART) : ((node.check_Child_State < 1)? c.FULL:c.PART);
			}
			var chkName = setting.check.chkStyle + "_" + (node[checkedKey] ? c.TRUE : c.FALSE) + "_" + fullStyle;
			chkName = (node.check_Focus && node.chkDisabled !== true) ? chkName + "_" + c.FOCUS : chkName;
			return consts.className.BUTTON + " " + c.DEFAULT + " " + chkName;
		},
		repairAllChk: function(setting, checked) {
			if (setting.check.enable && setting.check.chkStyle === consts.checkbox.STYLE) {
				var checkedKey = setting.data.key.checked,
				childKey = setting.data.key.children,
				root = data.getRoot(setting);
				for (var i = 0, l = root[childKey].length; i<l ; i++) {
					var node = root[childKey][i];
					if (node.nocheck !== true && node.chkDisabled !== true) {
						node[checkedKey] = checked;
					}
					view.setSonNodeCheckBox(setting, node, checked);
				}
			}
		},
		repairChkClass: function(setting, node) {
			if (!node) return;
			data.makeChkFlag(setting, node);
			if (node.nocheck !== true) {
				var checkObj = $$(node, consts.id.CHECK, setting);
				view.setChkClass(setting, checkObj, node);
			}
		},
		repairParentChkClass: function(setting, node) {
			if (!node || !node.parentTId) return;
			var pNode = node.getParentNode();
			view.repairChkClass(setting, pNode);
			view.repairParentChkClass(setting, pNode);
		},
		repairParentChkClassWithSelf: function(setting, node) {
			if (!node) return;
			var childKey = setting.data.key.children;
			if (node[childKey] && node[childKey].length > 0) {
				view.repairParentChkClass(setting, node[childKey][0]);
			} else {
				view.repairParentChkClass(setting, node);
			}
		},
		repairSonChkDisabled: function(setting, node, chkDisabled, inherit) {
			if (!node) return;
			var childKey = setting.data.key.children;
			if (node.chkDisabled != chkDisabled) {
				node.chkDisabled = chkDisabled;
			}
			view.repairChkClass(setting, node);
			if (node[childKey] && inherit) {
				for (var i = 0, l = node[childKey].length; i < l; i++) {
					var sNode = node[childKey][i];
					view.repairSonChkDisabled(setting, sNode, chkDisabled, inherit);
				}
			}
		},
		repairParentChkDisabled: function(setting, node, chkDisabled, inherit) {
			if (!node) return;
			if (node.chkDisabled != chkDisabled && inherit) {
				node.chkDisabled = chkDisabled;
			}
			view.repairChkClass(setting, node);
			view.repairParentChkDisabled(setting, node.getParentNode(), chkDisabled, inherit);
		},
		setChkClass: function(setting, obj, node) {
			if (!obj) return;
			if (node.nocheck === true) {
				obj.hide();
			} else {
				obj.show();
			}
            obj.attr('class', view.makeChkClass(setting, node));
		},
		setParentNodeCheckBox: function(setting, node, value, srcNode) {
			var childKey = setting.data.key.children,
			checkedKey = setting.data.key.checked,
			checkObj = $$(node, consts.id.CHECK, setting);
			if (!srcNode) srcNode = node;
			data.makeChkFlag(setting, node);
			if (node.nocheck !== true && node.chkDisabled !== true) {
				node[checkedKey] = value;
				view.setChkClass(setting, checkObj, node);
				if (setting.check.autoCheckTrigger && node != srcNode) {
					setting.treeObj.trigger(consts.event.CHECK, [null, setting.treeId, node]);
				}
			}
			if (node.parentTId) {
				var pSign = true;
				if (!value) {
					var pNodes = node.getParentNode()[childKey];
					for (var i = 0, l = pNodes.length; i < l; i++) {
						if ((pNodes[i].nocheck !== true && pNodes[i].chkDisabled !== true && pNodes[i][checkedKey])
						|| ((pNodes[i].nocheck === true || pNodes[i].chkDisabled === true) && pNodes[i].check_Child_State > 0)) {
							pSign = false;
							break;
						}
					}
				}
				if (pSign) {
					view.setParentNodeCheckBox(setting, node.getParentNode(), value, srcNode);
				}
			}
		},
		setSonNodeCheckBox: function(setting, node, value, srcNode) {
			if (!node) return;
			var childKey = setting.data.key.children,
			checkedKey = setting.data.key.checked,
			checkObj = $$(node, consts.id.CHECK, setting);
			if (!srcNode) srcNode = node;

			var hasDisable = false;
			if (node[childKey]) {
				for (var i = 0, l = node[childKey].length; i < l; i++) {
					var sNode = node[childKey][i];
					view.setSonNodeCheckBox(setting, sNode, value, srcNode);
					if (sNode.chkDisabled === true) hasDisable = true;
				}
			}

			if (node != data.getRoot(setting) && node.chkDisabled !== true) {
				if (hasDisable && node.nocheck !== true) {
					data.makeChkFlag(setting, node);
				}
				if (node.nocheck !== true && node.chkDisabled !== true) {
					node[checkedKey] = value;
					if (!hasDisable) node.check_Child_State = (node[childKey] && node[childKey].length > 0) ? (value ? 2 : 0) : -1;
				} else {
					node.check_Child_State = -1;
				}
				view.setChkClass(setting, checkObj, node);
				if (setting.check.autoCheckTrigger && node != srcNode && node.nocheck !== true && node.chkDisabled !== true) {
					setting.treeObj.trigger(consts.event.CHECK, [null, setting.treeId, node]);
				}
			}

		}
	},

	_z = {
		tools: _tools,
		view: _view,
		event: _event,
		data: _data
	};
	$.extend(true, $.fn.zTree.consts, _consts);
	$.extend(true, $.fn.zTree._z, _z);

	var zt = $.fn.zTree,
	tools = zt._z.tools,
	consts = zt.consts,
	view = zt._z.view,
	data = zt._z.data,
	event = zt._z.event,
	$$ = tools.$;

	data.exSetting(_setting);
	data.addInitBind(_bindEvent);
	data.addInitUnBind(_unbindEvent);
	data.addInitCache(_initCache);
	data.addInitNode(_initNode);
	data.addInitProxy(_eventProxy, true);
	data.addInitRoot(_initRoot);
	data.addBeforeA(_beforeA);
	data.addZTreeTools(_zTreeTools);

	var _createNodes = view.createNodes;
	view.createNodes = function(setting, level, nodes, parentNode, index) {
		if (_createNodes) _createNodes.apply(view, arguments);
		if (!nodes) return;
		view.repairParentChkClassWithSelf(setting, parentNode);
	}
	var _removeNode = view.removeNode;
	view.removeNode = function(setting, node) {
		var parentNode = node.getParentNode();
		if (_removeNode) _removeNode.apply(view, arguments);
		if (!node || !parentNode) return;
		view.repairChkClass(setting, parentNode);
		view.repairParentChkClass(setting, parentNode);
	}

	var _appendNodes = view.appendNodes;
	view.appendNodes = function(setting, level, nodes, parentNode, index, initFlag, openFlag) {
		var html = "";
		if (_appendNodes) {
			html = _appendNodes.apply(view, arguments);
		}
		if (parentNode) {
			data.makeChkFlag(setting, parentNode);
		}
		return html;
	}
})(jQuery);
/*
 * JQuery zTree exedit v3.5.24
 * http://zTree.me/
 *
 * Copyright (c) 2010 Hunter.z
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: hunter.z@263.net
 * Date: 2016-06-06
 */
(function($){
	//default consts of exedit
	var _consts = {
		event: {
			DRAG: "ztree_drag",
			DROP: "ztree_drop",
			RENAME: "ztree_rename",
			DRAGMOVE:"ztree_dragmove"
		},
		id: {
			EDIT: "_edit",
			INPUT: "_input",
			REMOVE: "_remove"
		},
		move: {
			TYPE_INNER: "inner",
			TYPE_PREV: "prev",
			TYPE_NEXT: "next"
		},
		node: {
			CURSELECTED_EDIT: "curSelectedNode_Edit",
			TMPTARGET_TREE: "tmpTargetzTree",
			TMPTARGET_NODE: "tmpTargetNode"
		}
	},
	//default setting of exedit
	_setting = {
		edit: {
			enable: false,
			editNameSelectAll: false,
			showRemoveBtn: true,
			showRenameBtn: true,
			removeTitle: "删除",
			renameTitle: "修改",
			drag: {
				autoExpandTrigger: false,
				isCopy: true,
				isMove: true,
				prev: true,
				next: true,
				inner: true,
				minMoveSize: 5,
				borderMax: 10,
				borderMin: -5,
				maxShowNodeNum: 5,
				autoOpenTime: 500
			}
		},
		view: {
			addHoverDom: null,
			removeHoverDom: null
		},
		callback: {
			beforeDrag:null,
			beforeDragOpen:null,
			beforeDrop:null,
			beforeEditName:null,
			beforeRename:null,
			onDrag:null,
			onDragMove:null,
			onDrop:null,
			onRename:null
		}
	},
	//default root of exedit
	_initRoot = function (setting) {
		var r = data.getRoot(setting), rs = data.getRoots();
		r.curEditNode = null;
		r.curEditInput = null;
		r.curHoverNode = null;
		r.dragFlag = 0;
		r.dragNodeShowBefore = [];
		r.dragMaskList = new Array();
		rs.showHoverDom = true;
	},
	//default cache of exedit
	_initCache = function(treeId) {},
	//default bind event of exedit
	_bindEvent = function(setting) {
		var o = setting.treeObj;
		var c = consts.event;
		o.bind(c.RENAME, function (event, treeId, treeNode, isCancel) {
			tools.apply(setting.callback.onRename, [event, treeId, treeNode, isCancel]);
		});

		o.bind(c.DRAG, function (event, srcEvent, treeId, treeNodes) {
			tools.apply(setting.callback.onDrag, [srcEvent, treeId, treeNodes]);
		});

		o.bind(c.DRAGMOVE,function(event, srcEvent, treeId, treeNodes){
			tools.apply(setting.callback.onDragMove,[srcEvent, treeId, treeNodes]);
		});

		o.bind(c.DROP, function (event, srcEvent, treeId, treeNodes, targetNode, moveType, isCopy) {
			tools.apply(setting.callback.onDrop, [srcEvent, treeId, treeNodes, targetNode, moveType, isCopy]);
		});
	},
	_unbindEvent = function(setting) {
		var o = setting.treeObj;
		var c = consts.event;
		o.unbind(c.RENAME);
		o.unbind(c.DRAG);
		o.unbind(c.DRAGMOVE);
		o.unbind(c.DROP);
	},
	//default event proxy of exedit
	_eventProxy = function(e) {
		var target = e.target,
		setting = data.getSetting(e.data.treeId),
		relatedTarget = e.relatedTarget,
		tId = "", node = null,
		nodeEventType = "", treeEventType = "",
		nodeEventCallback = null, treeEventCallback = null,
		tmp = null;

		if (tools.eqs(e.type, "mouseover")) {
			tmp = tools.getMDom(setting, target, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
			if (tmp) {
				tId = tools.getNodeMainDom(tmp).id;
				nodeEventType = "hoverOverNode";
			}
		} else if (tools.eqs(e.type, "mouseout")) {
			tmp = tools.getMDom(setting, relatedTarget, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
			if (!tmp) {
				tId = "remove";
				nodeEventType = "hoverOutNode";
			}
		} else if (tools.eqs(e.type, "mousedown")) {
			tmp = tools.getMDom(setting, target, [{tagName:"a", attrName:"treeNode"+consts.id.A}]);
			if (tmp) {
				tId = tools.getNodeMainDom(tmp).id;
				nodeEventType = "mousedownNode";
			}
		}
		if (tId.length>0) {
			node = data.getNodeCache(setting, tId);
			switch (nodeEventType) {
				case "mousedownNode" :
					nodeEventCallback = _handler.onMousedownNode;
					break;
				case "hoverOverNode" :
					nodeEventCallback = _handler.onHoverOverNode;
					break;
				case "hoverOutNode" :
					nodeEventCallback = _handler.onHoverOutNode;
					break;
			}
		}
		var proxyResult = {
			stop: false,
			node: node,
			nodeEventType: nodeEventType,
			nodeEventCallback: nodeEventCallback,
			treeEventType: treeEventType,
			treeEventCallback: treeEventCallback
		};
		return proxyResult
	},
	//default init node of exedit
	_initNode = function(setting, level, n, parentNode, isFirstNode, isLastNode, openFlag) {
		if (!n) return;
		n.isHover = false;
		n.editNameFlag = false;
	},
	//update zTreeObj, add method of edit
	_zTreeTools = function(setting, zTreeTools) {
		zTreeTools.cancelEditName = function(newName) {
			var root = data.getRoot(this.setting);
			if (!root.curEditNode) return;
			view.cancelCurEditNode(this.setting, newName?newName:null, true);
		}
		zTreeTools.copyNode = function(targetNode, node, moveType, isSilent) {
			if (!node) return null;
			if (targetNode && !targetNode.isParent && this.setting.data.keep.leaf && moveType === consts.move.TYPE_INNER) return null;
			var _this = this,
				newNode = tools.clone(node);
			if (!targetNode) {
				targetNode = null;
				moveType = consts.move.TYPE_INNER;
			}
			if (moveType == consts.move.TYPE_INNER) {
				function copyCallback() {
					view.addNodes(_this.setting, targetNode, -1, [newNode], isSilent);
				}

				if (tools.canAsync(this.setting, targetNode)) {
					view.asyncNode(this.setting, targetNode, isSilent, copyCallback);
				} else {
					copyCallback();
				}
			} else {
				view.addNodes(this.setting, targetNode.parentNode, -1, [newNode], isSilent);
				view.moveNode(this.setting, targetNode, newNode, moveType, false, isSilent);
			}
			return newNode;
		}
		zTreeTools.editName = function(node) {
			if (!node || !node.tId || node !== data.getNodeCache(this.setting, node.tId)) return;
			if (node.parentTId) view.expandCollapseParentNode(this.setting, node.getParentNode(), true);
			view.editNode(this.setting, node)
		}
		zTreeTools.moveNode = function(targetNode, node, moveType, isSilent) {
			if (!node) return node;
			if (targetNode && !targetNode.isParent && this.setting.data.keep.leaf && moveType === consts.move.TYPE_INNER) {
				return null;
			} else if (targetNode && ((node.parentTId == targetNode.tId && moveType == consts.move.TYPE_INNER) || $$(node, this.setting).find("#" + targetNode.tId).length > 0)) {
				return null;
			} else if (!targetNode) {
				targetNode = null;
			}
			var _this = this;
			function moveCallback() {
				view.moveNode(_this.setting, targetNode, node, moveType, false, isSilent);
			}
			if (tools.canAsync(this.setting, targetNode) && moveType === consts.move.TYPE_INNER) {
				view.asyncNode(this.setting, targetNode, isSilent, moveCallback);
			} else {
				moveCallback();
			}
			return node;
		}
		zTreeTools.setEditable = function(editable) {
			this.setting.edit.enable = editable;
			return this.refresh();
		}
	},
	//method of operate data
	_data = {
		setSonNodeLevel: function(setting, parentNode, node) {
			if (!node) return;
			var childKey = setting.data.key.children;
			node.level = (parentNode)? parentNode.level + 1 : 0;
			if (!node[childKey]) return;
			for (var i = 0, l = node[childKey].length; i < l; i++) {
				if (node[childKey][i]) data.setSonNodeLevel(setting, node, node[childKey][i]);
			}
		}
	},
	//method of event proxy
	_event = {

	},
	//method of event handler
	_handler = {
		onHoverOverNode: function(event, node) {
			var setting = data.getSetting(event.data.treeId),
			root = data.getRoot(setting);
			if (root.curHoverNode != node) {
				_handler.onHoverOutNode(event);
			}
			root.curHoverNode = node;
			view.addHoverDom(setting, node);
		},
		onHoverOutNode: function(event, node) {
			var setting = data.getSetting(event.data.treeId),
			root = data.getRoot(setting);
			if (root.curHoverNode && !data.isSelectedNode(setting, root.curHoverNode)) {
				view.removeTreeDom(setting, root.curHoverNode);
				root.curHoverNode = null;
			}
		},
		onMousedownNode: function(eventMouseDown, _node) {
			var i,l,
			setting = data.getSetting(eventMouseDown.data.treeId),
			root = data.getRoot(setting), roots = data.getRoots();
			//right click can't drag & drop
			if (eventMouseDown.button == 2 || !setting.edit.enable || (!setting.edit.drag.isCopy && !setting.edit.drag.isMove)) return true;

			//input of edit node name can't drag & drop
			var target = eventMouseDown.target,
			_nodes = data.getRoot(setting).curSelectedList,
			nodes = [];
			if (!data.isSelectedNode(setting, _node)) {
				nodes = [_node];
			} else {
				for (i=0, l=_nodes.length; i<l; i++) {
					if (_nodes[i].editNameFlag && tools.eqs(target.tagName, "input") && target.getAttribute("treeNode"+consts.id.INPUT) !== null) {
						return true;
					}
					nodes.push(_nodes[i]);
					if (nodes[0].parentTId !== _nodes[i].parentTId) {
						nodes = [_node];
						break;
					}
				}
			}

			view.editNodeBlur = true;
			view.cancelCurEditNode(setting);

			var doc = $(setting.treeObj.get(0).ownerDocument),
			body = $(setting.treeObj.get(0).ownerDocument.body), curNode, tmpArrow, tmpTarget,
			isOtherTree = false,
			targetSetting = setting,
			sourceSetting = setting,
			preNode, nextNode,
			preTmpTargetNodeId = null,
			preTmpMoveType = null,
			tmpTargetNodeId = null,
			moveType = consts.move.TYPE_INNER,
			mouseDownX = eventMouseDown.clientX,
			mouseDownY = eventMouseDown.clientY,
			startTime = (new Date()).getTime();

			if (tools.uCanDo(setting)) {
				doc.bind("mousemove", _docMouseMove);
			}
			function _docMouseMove(event) {
				//avoid start drag after click node
				if (root.dragFlag == 0 && Math.abs(mouseDownX - event.clientX) < setting.edit.drag.minMoveSize
					&& Math.abs(mouseDownY - event.clientY) < setting.edit.drag.minMoveSize) {
					return true;
				}
				var i, l, tmpNode, tmpDom, tmpNodes,
				childKey = setting.data.key.children;
				body.css("cursor", "pointer");

				if (root.dragFlag == 0) {
					if (tools.apply(setting.callback.beforeDrag, [setting.treeId, nodes], true) == false) {
						_docMouseUp(event);
						return true;
					}

					for (i=0, l=nodes.length; i<l; i++) {
						if (i==0) {
							root.dragNodeShowBefore = [];
						}
						tmpNode = nodes[i];
						if (tmpNode.isParent && tmpNode.open) {
							view.expandCollapseNode(setting, tmpNode, !tmpNode.open);
							root.dragNodeShowBefore[tmpNode.tId] = true;
						} else {
							root.dragNodeShowBefore[tmpNode.tId] = false;
						}
					}

					root.dragFlag = 1;
					roots.showHoverDom = false;
					tools.showIfameMask(setting, true);

					//sort
					var isOrder = true, lastIndex = -1;
					if (nodes.length>1) {
						var pNodes = nodes[0].parentTId ? nodes[0].getParentNode()[childKey] : data.getNodes(setting);
						tmpNodes = [];
						for (i=0, l=pNodes.length; i<l; i++) {
							if (root.dragNodeShowBefore[pNodes[i].tId] !== undefined) {
								if (isOrder && lastIndex > -1 && (lastIndex+1) !== i) {
									isOrder = false;
								}
								tmpNodes.push(pNodes[i]);
								lastIndex = i;
							}
							if (nodes.length === tmpNodes.length) {
								nodes = tmpNodes;
								break;
							}
						}
					}
					if (isOrder) {
						preNode = nodes[0].getPreNode();
						nextNode = nodes[nodes.length-1].getNextNode();
					}

					//set node in selected
					curNode = $$("<ul class='zTreeDragUL'></ul>", setting);
					for (i=0, l=nodes.length; i<l; i++) {
						tmpNode = nodes[i];
						tmpNode.editNameFlag = false;
						view.selectNode(setting, tmpNode, i>0);
						view.removeTreeDom(setting, tmpNode);

						if (i > setting.edit.drag.maxShowNodeNum-1) {
							continue;
						}

						tmpDom = $$("<li id='"+ tmpNode.tId +"_tmp'></li>", setting);
						tmpDom.append($$(tmpNode, consts.id.A, setting).clone());
						tmpDom.css("padding", "0");
						tmpDom.children("#" + tmpNode.tId + consts.id.A).removeClass(consts.node.CURSELECTED);
						curNode.append(tmpDom);
						if (i == setting.edit.drag.maxShowNodeNum-1) {
							tmpDom = $$("<li id='"+ tmpNode.tId +"_moretmp'><a>  ...  </a></li>", setting);
							curNode.append(tmpDom);
						}
					}
					curNode.attr("id", nodes[0].tId + consts.id.UL + "_tmp");
					curNode.addClass(setting.treeObj.attr("class"));
					curNode.appendTo(body);

					tmpArrow = $$("<span class='tmpzTreeMove_arrow'></span>", setting);
					tmpArrow.attr("id", "zTreeMove_arrow_tmp");
					tmpArrow.appendTo(body);

					setting.treeObj.trigger(consts.event.DRAG, [event, setting.treeId, nodes]);
				}

				if (root.dragFlag == 1) {
					if (tmpTarget && tmpArrow.attr("id") == event.target.id && tmpTargetNodeId && (event.clientX + doc.scrollLeft()+2) > ($("#" + tmpTargetNodeId + consts.id.A, tmpTarget).offset().left)) {
						var xT = $("#" + tmpTargetNodeId + consts.id.A, tmpTarget);
						event.target = (xT.length > 0) ? xT.get(0) : event.target;
					} else if (tmpTarget) {
						tmpTarget.removeClass(consts.node.TMPTARGET_TREE);
						if (tmpTargetNodeId) $("#" + tmpTargetNodeId + consts.id.A, tmpTarget).removeClass(consts.node.TMPTARGET_NODE + "_" + consts.move.TYPE_PREV)
							.removeClass(consts.node.TMPTARGET_NODE + "_" + _consts.move.TYPE_NEXT).removeClass(consts.node.TMPTARGET_NODE + "_" + _consts.move.TYPE_INNER);
					}
					tmpTarget = null;
					tmpTargetNodeId = null;

					//judge drag & drop in multi ztree
					isOtherTree = false;
					targetSetting = setting;
					var settings = data.getSettings();
					for (var s in settings) {
						if (settings[s].treeId && settings[s].edit.enable && settings[s].treeId != setting.treeId
							&& (event.target.id == settings[s].treeId || $(event.target).parents("#" + settings[s].treeId).length>0)) {
							isOtherTree = true;
							targetSetting = settings[s];
						}
					}

					var docScrollTop = doc.scrollTop(),
					docScrollLeft = doc.scrollLeft(),
					treeOffset = targetSetting.treeObj.offset(),
					scrollHeight = targetSetting.treeObj.get(0).scrollHeight,
					scrollWidth = targetSetting.treeObj.get(0).scrollWidth,
					dTop = (event.clientY + docScrollTop - treeOffset.top),
					dBottom = (targetSetting.treeObj.height() + treeOffset.top - event.clientY - docScrollTop),
					dLeft = (event.clientX + docScrollLeft - treeOffset.left),
					dRight = (targetSetting.treeObj.width() + treeOffset.left - event.clientX - docScrollLeft),
					isTop = (dTop < setting.edit.drag.borderMax && dTop > setting.edit.drag.borderMin),
					isBottom = (dBottom < setting.edit.drag.borderMax && dBottom > setting.edit.drag.borderMin),
					isLeft = (dLeft < setting.edit.drag.borderMax && dLeft > setting.edit.drag.borderMin),
					isRight = (dRight < setting.edit.drag.borderMax && dRight > setting.edit.drag.borderMin),
					isTreeInner = dTop > setting.edit.drag.borderMin && dBottom > setting.edit.drag.borderMin && dLeft > setting.edit.drag.borderMin && dRight > setting.edit.drag.borderMin,
					isTreeTop = (isTop && targetSetting.treeObj.scrollTop() <= 0),
					isTreeBottom = (isBottom && (targetSetting.treeObj.scrollTop() + targetSetting.treeObj.height()+10) >= scrollHeight),
					isTreeLeft = (isLeft && targetSetting.treeObj.scrollLeft() <= 0),
					isTreeRight = (isRight && (targetSetting.treeObj.scrollLeft() + targetSetting.treeObj.width()+10) >= scrollWidth);

					if (event.target && tools.isChildOrSelf(event.target, targetSetting.treeId)) {
						//get node <li> dom
						var targetObj = event.target;
						while (targetObj && targetObj.tagName && !tools.eqs(targetObj.tagName, "li") && targetObj.id != targetSetting.treeId) {
							targetObj = targetObj.parentNode;
						}

						var canMove = true;
						//don't move to self or children of self
						for (i=0, l=nodes.length; i<l; i++) {
							tmpNode = nodes[i];
							if (targetObj.id === tmpNode.tId) {
								canMove = false;
								break;
							} else if ($$(tmpNode, setting).find("#" + targetObj.id).length > 0) {
								canMove = false;
								break;
							}
						}
						if (canMove && event.target && tools.isChildOrSelf(event.target, targetObj.id + consts.id.A)) {
							tmpTarget = $(targetObj);
							tmpTargetNodeId = targetObj.id;
						}
					}

					//the mouse must be in zTree
					tmpNode = nodes[0];
					if (isTreeInner && tools.isChildOrSelf(event.target, targetSetting.treeId)) {
						//judge mouse move in root of ztree
						if (!tmpTarget && (event.target.id == targetSetting.treeId || isTreeTop || isTreeBottom || isTreeLeft || isTreeRight) && (isOtherTree || (!isOtherTree && tmpNode.parentTId))) {
							tmpTarget = targetSetting.treeObj;
						}
						//auto scroll top
						if (isTop) {
							targetSetting.treeObj.scrollTop(targetSetting.treeObj.scrollTop()-10);
						} else if (isBottom)  {
							targetSetting.treeObj.scrollTop(targetSetting.treeObj.scrollTop()+10);
						}
						if (isLeft) {
							targetSetting.treeObj.scrollLeft(targetSetting.treeObj.scrollLeft()-10);
						} else if (isRight) {
							targetSetting.treeObj.scrollLeft(targetSetting.treeObj.scrollLeft()+10);
						}
						//auto scroll left
						if (tmpTarget && tmpTarget != targetSetting.treeObj && tmpTarget.offset().left < targetSetting.treeObj.offset().left) {
							targetSetting.treeObj.scrollLeft(targetSetting.treeObj.scrollLeft()+ tmpTarget.offset().left - targetSetting.treeObj.offset().left);
						}
					}

					curNode.css({
						"top": (event.clientY + docScrollTop + 3) + "px",
						"left": (event.clientX + docScrollLeft + 3) + "px"
					});

					var dX = 0;
					var dY = 0;
					if (tmpTarget && tmpTarget.attr("id")!=targetSetting.treeId) {
						var tmpTargetNode = tmpTargetNodeId == null ? null: data.getNodeCache(targetSetting, tmpTargetNodeId),
							isCopy = ((event.ctrlKey || event.metaKey) && setting.edit.drag.isMove && setting.edit.drag.isCopy) || (!setting.edit.drag.isMove && setting.edit.drag.isCopy),
							isPrev = !!(preNode && tmpTargetNodeId === preNode.tId),
							isNext = !!(nextNode && tmpTargetNodeId === nextNode.tId),
							isInner = (tmpNode.parentTId && tmpNode.parentTId == tmpTargetNodeId),
							canPrev = (isCopy || !isNext) && tools.apply(targetSetting.edit.drag.prev, [targetSetting.treeId, nodes, tmpTargetNode], !!targetSetting.edit.drag.prev),
							canNext = (isCopy || !isPrev) && tools.apply(targetSetting.edit.drag.next, [targetSetting.treeId, nodes, tmpTargetNode], !!targetSetting.edit.drag.next),
							canInner = (isCopy || !isInner) && !(targetSetting.data.keep.leaf && !tmpTargetNode.isParent) && tools.apply(targetSetting.edit.drag.inner, [targetSetting.treeId, nodes, tmpTargetNode], !!targetSetting.edit.drag.inner);

						function clearMove() {
							tmpTarget = null;
							tmpTargetNodeId = "";
							moveType = consts.move.TYPE_INNER;
							tmpArrow.css({
								"display":"none"
							});
							if (window.zTreeMoveTimer) {
								clearTimeout(window.zTreeMoveTimer);
								window.zTreeMoveTargetNodeTId = null
							}
						}
						if (!canPrev && !canNext && !canInner) {
							clearMove();
						} else {
							var tmpTargetA = $("#" + tmpTargetNodeId + consts.id.A, tmpTarget),
								tmpNextA = tmpTargetNode.isLastNode ? null : $("#" + tmpTargetNode.getNextNode().tId + consts.id.A, tmpTarget.next()),
								tmpTop = tmpTargetA.offset().top,
								tmpLeft = tmpTargetA.offset().left,
								prevPercent = canPrev ? (canInner ? 0.25 : (canNext ? 0.5 : 1) ) : -1,
								nextPercent = canNext ? (canInner ? 0.75 : (canPrev ? 0.5 : 0) ) : -1,
								dY_percent = (event.clientY + docScrollTop - tmpTop)/tmpTargetA.height();

							if ((prevPercent==1 || dY_percent<=prevPercent && dY_percent>=-.2) && canPrev) {
								dX = 1 - tmpArrow.width();
								dY = tmpTop - tmpArrow.height()/2;
								moveType = consts.move.TYPE_PREV;
							} else if ((nextPercent==0 || dY_percent>=nextPercent && dY_percent<=1.2) && canNext) {
								dX = 1 - tmpArrow.width();
								dY = (tmpNextA == null || (tmpTargetNode.isParent && tmpTargetNode.open)) ? (tmpTop + tmpTargetA.height() - tmpArrow.height()/2) : (tmpNextA.offset().top - tmpArrow.height()/2);
								moveType = consts.move.TYPE_NEXT;
							} else if (canInner) {
								dX = 5 - tmpArrow.width();
								dY = tmpTop;
								moveType = consts.move.TYPE_INNER;
							} else {
								clearMove();
							}

							if (tmpTarget) {
								tmpArrow.css({
									"display":"block",
									"top": dY + "px",
									"left": (tmpLeft + dX) + "px"
								});
								tmpTargetA.addClass(consts.node.TMPTARGET_NODE + "_" + moveType);

								if (preTmpTargetNodeId != tmpTargetNodeId || preTmpMoveType != moveType) {
									startTime = (new Date()).getTime();
								}
								if (tmpTargetNode && tmpTargetNode.isParent && moveType == consts.move.TYPE_INNER) {
									var startTimer = true;
									if (window.zTreeMoveTimer && window.zTreeMoveTargetNodeTId !== tmpTargetNode.tId) {
										clearTimeout(window.zTreeMoveTimer);
										window.zTreeMoveTargetNodeTId = null;
									} else if (window.zTreeMoveTimer && window.zTreeMoveTargetNodeTId === tmpTargetNode.tId) {
										startTimer = false;
									}
									if (startTimer) {
										window.zTreeMoveTimer = setTimeout(function() {
											if (moveType != consts.move.TYPE_INNER) return;
											if (tmpTargetNode && tmpTargetNode.isParent && !tmpTargetNode.open && (new Date()).getTime() - startTime > targetSetting.edit.drag.autoOpenTime
												&& tools.apply(targetSetting.callback.beforeDragOpen, [targetSetting.treeId, tmpTargetNode], true)) {
												view.switchNode(targetSetting, tmpTargetNode);
												if (targetSetting.edit.drag.autoExpandTrigger) {
													targetSetting.treeObj.trigger(consts.event.EXPAND, [targetSetting.treeId, tmpTargetNode]);
												}
											}
										}, targetSetting.edit.drag.autoOpenTime+50);
										window.zTreeMoveTargetNodeTId = tmpTargetNode.tId;
									}
								}
							}
						}
					} else {
						moveType = consts.move.TYPE_INNER;
						if (tmpTarget && tools.apply(targetSetting.edit.drag.inner, [targetSetting.treeId, nodes, null], !!targetSetting.edit.drag.inner)) {
							tmpTarget.addClass(consts.node.TMPTARGET_TREE);
						} else {
							tmpTarget = null;
						}
						tmpArrow.css({
							"display":"none"
						});
						if (window.zTreeMoveTimer) {
							clearTimeout(window.zTreeMoveTimer);
							window.zTreeMoveTargetNodeTId = null;
						}
					}
					preTmpTargetNodeId = tmpTargetNodeId;
					preTmpMoveType = moveType;

					setting.treeObj.trigger(consts.event.DRAGMOVE, [event, setting.treeId, nodes]);
				}
				return false;
			}

			doc.bind("mouseup", _docMouseUp);
			function _docMouseUp(event) {
				if (window.zTreeMoveTimer) {
					clearTimeout(window.zTreeMoveTimer);
					window.zTreeMoveTargetNodeTId = null;
				}
				preTmpTargetNodeId = null;
				preTmpMoveType = null;
				doc.unbind("mousemove", _docMouseMove);
				doc.unbind("mouseup", _docMouseUp);
				doc.unbind("selectstart", _docSelect);
				body.css("cursor", "auto");
				if (tmpTarget) {
					tmpTarget.removeClass(consts.node.TMPTARGET_TREE);
					if (tmpTargetNodeId) $("#" + tmpTargetNodeId + consts.id.A, tmpTarget).removeClass(consts.node.TMPTARGET_NODE + "_" + consts.move.TYPE_PREV)
							.removeClass(consts.node.TMPTARGET_NODE + "_" + _consts.move.TYPE_NEXT).removeClass(consts.node.TMPTARGET_NODE + "_" + _consts.move.TYPE_INNER);
				}
				tools.showIfameMask(setting, false);

				roots.showHoverDom = true;
				if (root.dragFlag == 0) return;
				root.dragFlag = 0;

				var i, l, tmpNode;
				for (i=0, l=nodes.length; i<l; i++) {
					tmpNode = nodes[i];
					if (tmpNode.isParent && root.dragNodeShowBefore[tmpNode.tId] && !tmpNode.open) {
						view.expandCollapseNode(setting, tmpNode, !tmpNode.open);
						delete root.dragNodeShowBefore[tmpNode.tId];
					}
				}

				if (curNode) curNode.remove();
				if (tmpArrow) tmpArrow.remove();

				var isCopy = ((event.ctrlKey || event.metaKey) && setting.edit.drag.isMove && setting.edit.drag.isCopy) || (!setting.edit.drag.isMove && setting.edit.drag.isCopy);
				if (!isCopy && tmpTarget && tmpTargetNodeId && nodes[0].parentTId && tmpTargetNodeId==nodes[0].parentTId && moveType == consts.move.TYPE_INNER) {
					tmpTarget = null;
				}
				if (tmpTarget) {
					var dragTargetNode = tmpTargetNodeId == null ? null: data.getNodeCache(targetSetting, tmpTargetNodeId);
					if (tools.apply(setting.callback.beforeDrop, [targetSetting.treeId, nodes, dragTargetNode, moveType, isCopy], true) == false) {
						view.selectNodes(sourceSetting, nodes);
						return;
					}
					var newNodes = isCopy ? tools.clone(nodes) : nodes;

					function dropCallback() {
						if (isOtherTree) {
							if (!isCopy) {
								for(var i=0, l=nodes.length; i<l; i++) {
									view.removeNode(setting, nodes[i]);
								}
							}
							if (moveType == consts.move.TYPE_INNER) {
								view.addNodes(targetSetting, dragTargetNode, -1, newNodes);
							} else {
								view.addNodes(targetSetting, dragTargetNode.getParentNode(), moveType == consts.move.TYPE_PREV ? dragTargetNode.getIndex() : dragTargetNode.getIndex()+1, newNodes);
							}
						} else {
							if (isCopy && moveType == consts.move.TYPE_INNER) {
								view.addNodes(targetSetting, dragTargetNode, -1, newNodes);
							} else if (isCopy) {
								view.addNodes(targetSetting, dragTargetNode.getParentNode(), moveType == consts.move.TYPE_PREV ? dragTargetNode.getIndex() : dragTargetNode.getIndex()+1, newNodes);
							} else {
								if (moveType != consts.move.TYPE_NEXT) {
									for (i=0, l=newNodes.length; i<l; i++) {
										view.moveNode(targetSetting, dragTargetNode, newNodes[i], moveType, false);
									}
								} else {
									for (i=-1, l=newNodes.length-1; i<l; l--) {
										view.moveNode(targetSetting, dragTargetNode, newNodes[l], moveType, false);
									}
								}
							}
						}
						view.selectNodes(targetSetting, newNodes);

						var a = $$(newNodes[0], setting).get(0);
						view.scrollIntoView(a);

						setting.treeObj.trigger(consts.event.DROP, [event, targetSetting.treeId, newNodes, dragTargetNode, moveType, isCopy]);
					}

					if (moveType == consts.move.TYPE_INNER && tools.canAsync(targetSetting, dragTargetNode)) {
						view.asyncNode(targetSetting, dragTargetNode, false, dropCallback);
					} else {
						dropCallback();
					}

				} else {
					view.selectNodes(sourceSetting, nodes);
					setting.treeObj.trigger(consts.event.DROP, [event, setting.treeId, nodes, null, null, null]);
				}
			}

			doc.bind("selectstart", _docSelect);
			function _docSelect() {
				return false;
			}

			//Avoid FireFox's Bug
			//If zTree Div CSS set 'overflow', so drag node outside of zTree, and event.target is error.
			if(eventMouseDown.preventDefault) {
				eventMouseDown.preventDefault();
			}
			return true;
		}
	},
	//method of tools for zTree
	_tools = {
		getAbs: function (obj) {
			var oRect = obj.getBoundingClientRect(),
			scrollTop = document.body.scrollTop+document.documentElement.scrollTop,
			scrollLeft = document.body.scrollLeft+document.documentElement.scrollLeft;
			return [oRect.left+scrollLeft,oRect.top+scrollTop];
		},
		inputFocus: function(inputObj) {
			if (inputObj.get(0)) {
				inputObj.focus();
				tools.setCursorPosition(inputObj.get(0), inputObj.val().length);
			}
		},
		inputSelect: function(inputObj) {
			if (inputObj.get(0)) {
				inputObj.focus();
				inputObj.select();
			}
		},
		setCursorPosition: function(obj, pos){
			if(obj.setSelectionRange) {
				obj.focus();
				obj.setSelectionRange(pos,pos);
			} else if (obj.createTextRange) {
				var range = obj.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		},
		showIfameMask: function(setting, showSign) {
			var root = data.getRoot(setting);
			//clear full mask
			while (root.dragMaskList.length > 0) {
				root.dragMaskList[0].remove();
				root.dragMaskList.shift();
			}
			if (showSign) {
				//show mask
				var iframeList = $$("iframe", setting);
				for (var i = 0, l = iframeList.length; i < l; i++) {
					var obj = iframeList.get(i),
					r = tools.getAbs(obj),
					dragMask = $$("<div id='zTreeMask_" + i + "' class='zTreeMask' style='top:" + r[1] + "px; left:" + r[0] + "px; width:" + obj.offsetWidth + "px; height:" + obj.offsetHeight + "px;'></div>", setting);
					dragMask.appendTo($$("body", setting));
					root.dragMaskList.push(dragMask);
				}
			}
		}
	},
	//method of operate ztree dom
	_view = {
		addEditBtn: function(setting, node) {
			if (node.editNameFlag || $$(node, consts.id.EDIT, setting).length > 0) {
				return;
			}
			if (!tools.apply(setting.edit.showRenameBtn, [setting.treeId, node], setting.edit.showRenameBtn)) {
				return;
			}
			var aObj = $$(node, consts.id.A, setting),
			editStr = "<span class='" + consts.className.BUTTON + " edit' id='" + node.tId + consts.id.EDIT + "' title='"+tools.apply(setting.edit.renameTitle, [setting.treeId, node], setting.edit.renameTitle)+"' treeNode"+consts.id.EDIT+" style='display:none;'></span>";
			aObj.append(editStr);

			$$(node, consts.id.EDIT, setting).bind('click',
				function() {
					if (!tools.uCanDo(setting) || tools.apply(setting.callback.beforeEditName, [setting.treeId, node], true) == false) return false;
					view.editNode(setting, node);
					return false;
				}
				).show();
		},
		addRemoveBtn: function(setting, node) {
			if (node.editNameFlag || $$(node, consts.id.REMOVE, setting).length > 0) {
				return;
			}
			if (!tools.apply(setting.edit.showRemoveBtn, [setting.treeId, node], setting.edit.showRemoveBtn)) {
				return;
			}
			var aObj = $$(node, consts.id.A, setting),
			removeStr = "<span class='" + consts.className.BUTTON + " remove' id='" + node.tId + consts.id.REMOVE + "' title='"+tools.apply(setting.edit.removeTitle, [setting.treeId, node], setting.edit.removeTitle)+"' treeNode"+consts.id.REMOVE+" style='display:none;'></span>";
			aObj.append(removeStr);

			$$(node, consts.id.REMOVE, setting).bind('click',
				function() {
					if (!tools.uCanDo(setting) || tools.apply(setting.callback.beforeRemove, [setting.treeId, node], true) == false) return false;
					view.removeNode(setting, node);
					setting.treeObj.trigger(consts.event.REMOVE, [setting.treeId, node]);
					return false;
				}
				).bind('mousedown',
				function(eventMouseDown) {
					return true;
				}
				).show();
		},
		addHoverDom: function(setting, node) {
			if (data.getRoots().showHoverDom) {
				node.isHover = true;
				if (setting.edit.enable) {
					view.addEditBtn(setting, node);
					view.addRemoveBtn(setting, node);
				}
				tools.apply(setting.view.addHoverDom, [setting.treeId, node]);
			}
		},
		cancelCurEditNode: function (setting, forceName, isCancel) {
			var root = data.getRoot(setting),
			nameKey = setting.data.key.name,
			node = root.curEditNode;

			if (node) {
				var inputObj = root.curEditInput,
				newName = forceName ? forceName:(isCancel ? node[nameKey]: inputObj.val());
				if (tools.apply(setting.callback.beforeRename, [setting.treeId, node, newName, isCancel], true) === false) {
					return false;
				}
                node[nameKey] = newName;
                var aObj = $$(node, consts.id.A, setting);
				aObj.removeClass(consts.node.CURSELECTED_EDIT);
				inputObj.unbind();
				view.setNodeName(setting, node);
				node.editNameFlag = false;
				root.curEditNode = null;
				root.curEditInput = null;
				view.selectNode(setting, node, false);
                setting.treeObj.trigger(consts.event.RENAME, [setting.treeId, node, isCancel]);
			}
			root.noSelection = true;
			return true;
		},
		editNode: function(setting, node) {
			var root = data.getRoot(setting);
			view.editNodeBlur = false;
			if (data.isSelectedNode(setting, node) && root.curEditNode == node && node.editNameFlag) {
				setTimeout(function() {tools.inputFocus(root.curEditInput);}, 0);
				return;
			}
			var nameKey = setting.data.key.name;
			node.editNameFlag = true;
			view.removeTreeDom(setting, node);
			view.cancelCurEditNode(setting);
			view.selectNode(setting, node, false);
			$$(node, consts.id.SPAN, setting).html("<input type=text class='rename' id='" + node.tId + consts.id.INPUT + "' treeNode" + consts.id.INPUT + " >");
			var inputObj = $$(node, consts.id.INPUT, setting);
			inputObj.attr("value", node[nameKey]);
			if (setting.edit.editNameSelectAll) {
				tools.inputSelect(inputObj);
			} else {
				tools.inputFocus(inputObj);
			}

			inputObj.bind('blur', function(event) {
				if (!view.editNodeBlur) {
					view.cancelCurEditNode(setting);
				}
			}).bind('keydown', function(event) {
				if (event.keyCode=="13") {
					view.editNodeBlur = true;
					view.cancelCurEditNode(setting);
				} else if (event.keyCode=="27") {
					view.cancelCurEditNode(setting, null, true);
				}
			}).bind('click', function(event) {
				return false;
			}).bind('dblclick', function(event) {
				return false;
			});

			$$(node, consts.id.A, setting).addClass(consts.node.CURSELECTED_EDIT);
			root.curEditInput = inputObj;
			root.noSelection = false;
			root.curEditNode = node;
		},
		moveNode: function(setting, targetNode, node, moveType, animateFlag, isSilent) {
			var root = data.getRoot(setting),
			childKey = setting.data.key.children;
			if (targetNode == node) return;
			if (setting.data.keep.leaf && targetNode && !targetNode.isParent && moveType == consts.move.TYPE_INNER) return;
			var oldParentNode = (node.parentTId ? node.getParentNode(): root),
			targetNodeIsRoot = (targetNode === null || targetNode == root);
			if (targetNodeIsRoot && targetNode === null) targetNode = root;
			if (targetNodeIsRoot) moveType = consts.move.TYPE_INNER;
			var targetParentNode = (targetNode.parentTId ? targetNode.getParentNode() : root);

			if (moveType != consts.move.TYPE_PREV && moveType != consts.move.TYPE_NEXT) {
				moveType = consts.move.TYPE_INNER;
			}

			if (moveType == consts.move.TYPE_INNER) {
				if (targetNodeIsRoot) {
					//parentTId of root node is null
					node.parentTId = null;
				} else {
					if (!targetNode.isParent) {
						targetNode.isParent = true;
						targetNode.open = !!targetNode.open;
						view.setNodeLineIcos(setting, targetNode);
					}
					node.parentTId = targetNode.tId;
				}
			}

			//move node Dom
			var targetObj, target_ulObj;
			if (targetNodeIsRoot) {
				targetObj = setting.treeObj;
				target_ulObj = targetObj;
			} else {
				if (!isSilent && moveType == consts.move.TYPE_INNER) {
					view.expandCollapseNode(setting, targetNode, true, false);
				} else if (!isSilent) {
					view.expandCollapseNode(setting, targetNode.getParentNode(), true, false);
				}
				targetObj = $$(targetNode, setting);
				target_ulObj = $$(targetNode, consts.id.UL, setting);
				if (!!targetObj.get(0) && !target_ulObj.get(0)) {
					var ulstr = [];
					view.makeUlHtml(setting, targetNode, ulstr, '');
					targetObj.append(ulstr.join(''));
				}
				target_ulObj = $$(targetNode, consts.id.UL, setting);
			}
			var nodeDom = $$(node, setting);
			if (!nodeDom.get(0)) {
				nodeDom = view.appendNodes(setting, node.level, [node], null, -1, false, true).join('');
			} else if (!targetObj.get(0)) {
				nodeDom.remove();
			}
			if (target_ulObj.get(0) && moveType == consts.move.TYPE_INNER) {
				target_ulObj.append(nodeDom);
			} else if (targetObj.get(0) && moveType == consts.move.TYPE_PREV) {
				targetObj.before(nodeDom);
			} else if (targetObj.get(0) && moveType == consts.move.TYPE_NEXT) {
				targetObj.after(nodeDom);
			}

			//repair the data after move
			var i,l,
			tmpSrcIndex = -1,
			tmpTargetIndex = 0,
			oldNeighbor = null,
			newNeighbor = null,
			oldLevel = node.level;
			if (node.isFirstNode) {
				tmpSrcIndex = 0;
				if (oldParentNode[childKey].length > 1 ) {
					oldNeighbor = oldParentNode[childKey][1];
					oldNeighbor.isFirstNode = true;
				}
			} else if (node.isLastNode) {
				tmpSrcIndex = oldParentNode[childKey].length -1;
				oldNeighbor = oldParentNode[childKey][tmpSrcIndex - 1];
				oldNeighbor.isLastNode = true;
			} else {
				for (i = 0, l = oldParentNode[childKey].length; i < l; i++) {
					if (oldParentNode[childKey][i].tId == node.tId) {
						tmpSrcIndex = i;
						break;
					}
				}
			}
			if (tmpSrcIndex >= 0) {
				oldParentNode[childKey].splice(tmpSrcIndex, 1);
			}
			if (moveType != consts.move.TYPE_INNER) {
				for (i = 0, l = targetParentNode[childKey].length; i < l; i++) {
					if (targetParentNode[childKey][i].tId == targetNode.tId) tmpTargetIndex = i;
				}
			}
			if (moveType == consts.move.TYPE_INNER) {
				if (!targetNode[childKey]) targetNode[childKey] = new Array();
				if (targetNode[childKey].length > 0) {
					newNeighbor = targetNode[childKey][targetNode[childKey].length - 1];
					newNeighbor.isLastNode = false;
				}
				targetNode[childKey].splice(targetNode[childKey].length, 0, node);
				node.isLastNode = true;
				node.isFirstNode = (targetNode[childKey].length == 1);
			} else if (targetNode.isFirstNode && moveType == consts.move.TYPE_PREV) {
				targetParentNode[childKey].splice(tmpTargetIndex, 0, node);
				newNeighbor = targetNode;
				newNeighbor.isFirstNode = false;
				node.parentTId = targetNode.parentTId;
				node.isFirstNode = true;
				node.isLastNode = false;

			} else if (targetNode.isLastNode && moveType == consts.move.TYPE_NEXT) {
				targetParentNode[childKey].splice(tmpTargetIndex + 1, 0, node);
				newNeighbor = targetNode;
				newNeighbor.isLastNode = false;
				node.parentTId = targetNode.parentTId;
				node.isFirstNode = false;
				node.isLastNode = true;

			} else {
				if (moveType == consts.move.TYPE_PREV) {
					targetParentNode[childKey].splice(tmpTargetIndex, 0, node);
				} else {
					targetParentNode[childKey].splice(tmpTargetIndex + 1, 0, node);
				}
				node.parentTId = targetNode.parentTId;
				node.isFirstNode = false;
				node.isLastNode = false;
			}
			data.fixPIdKeyValue(setting, node);
			data.setSonNodeLevel(setting, node.getParentNode(), node);

			//repair node what been moved
			view.setNodeLineIcos(setting, node);
			view.repairNodeLevelClass(setting, node, oldLevel)

			//repair node's old parentNode dom
			if (!setting.data.keep.parent && oldParentNode[childKey].length < 1) {
				//old parentNode has no child nodes
				oldParentNode.isParent = false;
				oldParentNode.open = false;
				var tmp_ulObj = $$(oldParentNode, consts.id.UL, setting),
				tmp_switchObj = $$(oldParentNode, consts.id.SWITCH, setting),
				tmp_icoObj = $$(oldParentNode, consts.id.ICON, setting);
				view.replaceSwitchClass(oldParentNode, tmp_switchObj, consts.folder.DOCU);
				view.replaceIcoClass(oldParentNode, tmp_icoObj, consts.folder.DOCU);
				tmp_ulObj.css("display", "none");

			} else if (oldNeighbor) {
				//old neigbor node
				view.setNodeLineIcos(setting, oldNeighbor);
			}

			//new neigbor node
			if (newNeighbor) {
				view.setNodeLineIcos(setting, newNeighbor);
			}

			//repair checkbox / radio
			if (!!setting.check && setting.check.enable && view.repairChkClass) {
				view.repairChkClass(setting, oldParentNode);
				view.repairParentChkClassWithSelf(setting, oldParentNode);
				if (oldParentNode != node.parent)
					view.repairParentChkClassWithSelf(setting, node);
			}

			//expand parents after move
			if (!isSilent) {
				view.expandCollapseParentNode(setting, node.getParentNode(), true, animateFlag);
			}
		},
		removeEditBtn: function(setting, node) {
			$$(node, consts.id.EDIT, setting).unbind().remove();
		},
		removeRemoveBtn: function(setting, node) {
			$$(node, consts.id.REMOVE, setting).unbind().remove();
		},
		removeTreeDom: function(setting, node) {
			node.isHover = false;
			view.removeEditBtn(setting, node);
			view.removeRemoveBtn(setting, node);
			tools.apply(setting.view.removeHoverDom, [setting.treeId, node]);
		},
		repairNodeLevelClass: function(setting, node, oldLevel) {
			if (oldLevel === node.level) return;
			var liObj = $$(node, setting),
			aObj = $$(node, consts.id.A, setting),
			ulObj = $$(node, consts.id.UL, setting),
			oldClass = consts.className.LEVEL + oldLevel,
			newClass = consts.className.LEVEL + node.level;
			liObj.removeClass(oldClass);
			liObj.addClass(newClass);
			aObj.removeClass(oldClass);
			aObj.addClass(newClass);
			ulObj.removeClass(oldClass);
			ulObj.addClass(newClass);
		},
		selectNodes : function(setting, nodes) {
			for (var i=0, l=nodes.length; i<l; i++) {
				view.selectNode(setting, nodes[i], i>0);
			}
		}
	},

	_z = {
		tools: _tools,
		view: _view,
		event: _event,
		data: _data
	};
	$.extend(true, $.fn.zTree.consts, _consts);
	$.extend(true, $.fn.zTree._z, _z);

	var zt = $.fn.zTree,
	tools = zt._z.tools,
	consts = zt.consts,
	view = zt._z.view,
	data = zt._z.data,
	event = zt._z.event,
	$$ = tools.$;

	data.exSetting(_setting);
	data.addInitBind(_bindEvent);
	data.addInitUnBind(_unbindEvent);
	data.addInitCache(_initCache);
	data.addInitNode(_initNode);
	data.addInitProxy(_eventProxy);
	data.addInitRoot(_initRoot);
	data.addZTreeTools(_zTreeTools);

	var _cancelPreSelectedNode = view.cancelPreSelectedNode;
	view.cancelPreSelectedNode = function (setting, node) {
		var list = data.getRoot(setting).curSelectedList;
		for (var i=0, j=list.length; i<j; i++) {
			if (!node || node === list[i]) {
				view.removeTreeDom(setting, list[i]);
				if (node) break;
			}
		}
		if (_cancelPreSelectedNode) _cancelPreSelectedNode.apply(view, arguments);
	}

	var _createNodes = view.createNodes;
	view.createNodes = function(setting, level, nodes, parentNode, index) {
		if (_createNodes) {
			_createNodes.apply(view, arguments);
		}
		if (!nodes) return;
		if (view.repairParentChkClassWithSelf) {
			view.repairParentChkClassWithSelf(setting, parentNode);
		}
	}

	var _makeNodeUrl = view.makeNodeUrl;
	view.makeNodeUrl = function(setting, node) {
		return setting.edit.enable ? null : (_makeNodeUrl.apply(view, arguments));
	}

	var _removeNode = view.removeNode;
	view.removeNode = function(setting, node) {
		var root = data.getRoot(setting);
		if (root.curEditNode === node) root.curEditNode = null;
		if (_removeNode) {
			_removeNode.apply(view, arguments);
		}
	}

	var _selectNode = view.selectNode;
	view.selectNode = function(setting, node, addFlag) {
		var root = data.getRoot(setting);
		if (data.isSelectedNode(setting, node) && root.curEditNode == node && node.editNameFlag) {
			return false;
		}
		if (_selectNode) _selectNode.apply(view, arguments);
		view.addHoverDom(setting, node);
		return true;
	}

	var _uCanDo = tools.uCanDo;
	tools.uCanDo = function(setting, e) {
		var root = data.getRoot(setting);
		if (e && (tools.eqs(e.type, "mouseover") || tools.eqs(e.type, "mouseout") || tools.eqs(e.type, "mousedown") || tools.eqs(e.type, "mouseup"))) {
			return true;
		}
		if (root.curEditNode) {
			view.editNodeBlur = false;
			root.curEditInput.focus();
		}
		return (!root.curEditNode) && (_uCanDo ? _uCanDo.apply(view, arguments) : true);
	}
})(jQuery);
/*
 * JQuery zTree exHideNodes v3.5.24
 * http://zTree.me/
 *
 * Copyright (c) 2010 Hunter.z
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: hunter.z@263.net
 * Date: 2016-06-06
 */
(function($){
	//default init node of exLib
	var _initNode = function(setting, level, n, parentNode, isFirstNode, isLastNode, openFlag) {
		if (typeof n.isHidden == "string") n.isHidden = tools.eqs(n.isHidden, "true");
		n.isHidden = !!n.isHidden;
		data.initHideForExCheck(setting, n);
	},
	//add dom for check
	_beforeA = function(setting, node, html) {},
	//update zTreeObj, add method of exLib
	_zTreeTools = function(setting, zTreeTools) {
		zTreeTools.showNodes = function(nodes, options) {
			view.showNodes(setting, nodes, options);
		}
		zTreeTools.showNode = function(node, options) {
			if (!node) {
				return;
			}
			view.showNodes(setting, [node], options);
		}
		zTreeTools.hideNodes = function(nodes, options) {
			view.hideNodes(setting, nodes, options);
		}
		zTreeTools.hideNode = function(node, options) {
			if (!node) {
				return;
			}
			view.hideNodes(setting, [node], options);
		}

		var _checkNode = zTreeTools.checkNode;
		if (_checkNode) {
			zTreeTools.checkNode = function(node, checked, checkTypeFlag, callbackFlag) {
				if (!!node && !!node.isHidden) {
					return;
				}
				_checkNode.apply(zTreeTools, arguments);
			}
		}
	},
	//method of operate data
	_data = {
		initHideForExCheck: function(setting, n) {
			if (n.isHidden && setting.check && setting.check.enable) {
				if(typeof n._nocheck == "undefined") {
					n._nocheck = !!n.nocheck
					n.nocheck = true;
				}
				n.check_Child_State = -1;
				if (view.repairParentChkClassWithSelf) {
					view.repairParentChkClassWithSelf(setting, n);
				}
			}
		},
		initShowForExCheck: function(setting, n) {
			if (!n.isHidden && setting.check && setting.check.enable) {
				if(typeof n._nocheck != "undefined") {
					n.nocheck = n._nocheck;
					delete n._nocheck;
				}
				if (view.setChkClass) {
					var checkObj = $$(n, consts.id.CHECK, setting);
					view.setChkClass(setting, checkObj, n);
				}
				if (view.repairParentChkClassWithSelf) {
					view.repairParentChkClassWithSelf(setting, n);
				}
			}
		}
	},
	//method of operate ztree dom
	_view = {
		clearOldFirstNode: function(setting, node) {
			var n = node.getNextNode();
			while(!!n){
				if (n.isFirstNode) {
					n.isFirstNode = false;
					view.setNodeLineIcos(setting, n);
					break;
				}
				if (n.isLastNode) {
					break;
				}
				n = n.getNextNode();
			}
		},
        clearOldLastNode: function(setting, node, openFlag) {
            var n = node.getPreNode();
            while(!!n){
                if (n.isLastNode) {
                    n.isLastNode = false;
                    if (openFlag) {
                        view.setNodeLineIcos(setting, n);
                    }
                    break;
                }
                if (n.isFirstNode) {
                    break;
                }
                n = n.getPreNode();
            }
        },
		makeDOMNodeMainBefore: function(html, setting, node) {
			html.push("<li ", (node.isHidden ? "style='display:none;' " : ""), "id='", node.tId, "' class='", consts.className.LEVEL, node.level,"' tabindex='0' hidefocus='true' treenode>");
		},
		showNode: function(setting, node, options) {
			node.isHidden = false;
			data.initShowForExCheck(setting, node);
			$$(node, setting).show();
		},
		showNodes: function(setting, nodes, options) {
			if (!nodes || nodes.length == 0) {
				return;
			}
			var pList = {}, i, j;
			for (i=0, j=nodes.length; i<j; i++) {
				var n = nodes[i];
				if (!pList[n.parentTId]) {
					var pn = n.getParentNode();
					pList[n.parentTId] = (pn === null) ? data.getRoot(setting) : n.getParentNode();
				}
				view.showNode(setting, n, options);
			}
			for (var tId in pList) {
				var children = pList[tId][setting.data.key.children];
				view.setFirstNodeForShow(setting, children);
				view.setLastNodeForShow(setting, children);
			}
		},
		hideNode: function(setting, node, options) {
			node.isHidden = true;
			node.isFirstNode = false;
			node.isLastNode = false;
			data.initHideForExCheck(setting, node);
			view.cancelPreSelectedNode(setting, node);
			$$(node, setting).hide();
		},
		hideNodes: function(setting, nodes, options) {
			if (!nodes || nodes.length == 0) {
				return;
			}
			var pList = {}, i, j;
			for (i=0, j=nodes.length; i<j; i++) {
				var n = nodes[i];
				if ((n.isFirstNode || n.isLastNode) && !pList[n.parentTId]) {
					var pn = n.getParentNode();
					pList[n.parentTId] = (pn === null) ? data.getRoot(setting) : n.getParentNode();
				}
				view.hideNode(setting, n, options);
			}
			for (var tId in pList) {
				var children = pList[tId][setting.data.key.children];
				view.setFirstNodeForHide(setting, children);
				view.setLastNodeForHide(setting, children);
			}
		},
		setFirstNode: function(setting, parentNode) {
			var childKey = setting.data.key.children, childLength = parentNode[childKey].length;
			if (childLength > 0 && !parentNode[childKey][0].isHidden) {
				parentNode[childKey][0].isFirstNode = true;
			} else if (childLength > 0) {
				view.setFirstNodeForHide(setting, parentNode[childKey]);
			}
		},
		setLastNode: function(setting, parentNode) {
			var childKey = setting.data.key.children, childLength = parentNode[childKey].length;
			if (childLength > 0 && !parentNode[childKey][0].isHidden) {
				parentNode[childKey][childLength - 1].isLastNode = true;
			} else if (childLength > 0) {
				view.setLastNodeForHide(setting, parentNode[childKey]);
			}
		},
		setFirstNodeForHide: function(setting, nodes) {
			var n,i,j;
			for (i=0, j=nodes.length; i<j; i++) {
				n = nodes[i];
				if (n.isFirstNode) {
					break;
				}
				if (!n.isHidden && !n.isFirstNode) {
					n.isFirstNode = true;
					view.setNodeLineIcos(setting, n);
					break;
				} else {
					n = null;
				}
			}
			return n;
		},
		setFirstNodeForShow: function(setting, nodes) {
			var n,i,j, first, old;
			for(i=0, j=nodes.length; i<j; i++) {
				n = nodes[i];
				if (!first && !n.isHidden && n.isFirstNode) {
					first = n;
					break;
				} else if (!first && !n.isHidden && !n.isFirstNode) {
					n.isFirstNode = true;
					first = n;
					view.setNodeLineIcos(setting, n);
				} else if (first && n.isFirstNode) {
					n.isFirstNode = false;
					old = n;
					view.setNodeLineIcos(setting, n);
					break;
				} else {
					n = null;
				}
			}
			return {"new":first, "old":old};
		},
		setLastNodeForHide: function(setting, nodes) {
			var n,i;
			for (i=nodes.length-1; i>=0; i--) {
				n = nodes[i];
				if (n.isLastNode) {
					break;
				}
				if (!n.isHidden && !n.isLastNode) {
					n.isLastNode = true;
					view.setNodeLineIcos(setting, n);
					break;
				} else {
					n = null;
				}
			}
			return n;
		},
		setLastNodeForShow: function(setting, nodes) {
			var n,i,j, last, old;
			for (i=nodes.length-1; i>=0; i--) {
				n = nodes[i];
				if (!last && !n.isHidden && n.isLastNode) {
					last = n;
					break;
				} else if (!last && !n.isHidden && !n.isLastNode) {
					n.isLastNode = true;
					last = n;
					view.setNodeLineIcos(setting, n);
				} else if (last && n.isLastNode) {
					n.isLastNode = false;
					old = n;
					view.setNodeLineIcos(setting, n);
					break;
				} else {
					n = null;
				}
			}
			return {"new":last, "old":old};
		}
	},

	_z = {
		view: _view,
		data: _data
	};
	$.extend(true, $.fn.zTree._z, _z);

	var zt = $.fn.zTree,
	tools = zt._z.tools,
	consts = zt.consts,
	view = zt._z.view,
	data = zt._z.data,
	event = zt._z.event,
	$$ = tools.$;

	data.addInitNode(_initNode);
	data.addBeforeA(_beforeA);
	data.addZTreeTools(_zTreeTools);

//	Override method in core
	var _dInitNode = data.initNode;
    data.initNode = function(setting, level, node, parentNode, isFirstNode, isLastNode, openFlag) {
        var tmpPNode = (parentNode) ? parentNode: data.getRoot(setting),
            children = tmpPNode[setting.data.key.children];
        data.tmpHideFirstNode = view.setFirstNodeForHide(setting, children);
        data.tmpHideLastNode = view.setLastNodeForHide(setting, children);
        if (openFlag) {
            view.setNodeLineIcos(setting, data.tmpHideFirstNode);
            view.setNodeLineIcos(setting, data.tmpHideLastNode);
        }
        isFirstNode = (data.tmpHideFirstNode === node);
        isLastNode = (data.tmpHideLastNode === node);
        if (_dInitNode) _dInitNode.apply(data, arguments);
        if (openFlag && isLastNode) {
            view.clearOldLastNode(setting, node, openFlag);
        }
    };

	var _makeChkFlag = data.makeChkFlag;
	if (!!_makeChkFlag) {
		data.makeChkFlag = function(setting, node) {
			if (!!node && !!node.isHidden) {
				return;
			}
			_makeChkFlag.apply(data, arguments);
		}
	}

	var _getTreeCheckedNodes = data.getTreeCheckedNodes;
	if (!!_getTreeCheckedNodes) {
		data.getTreeCheckedNodes = function(setting, nodes, checked, results) {
			if (!!nodes && nodes.length > 0) {
				var p = nodes[0].getParentNode();
				if (!!p && !!p.isHidden) {
					return [];
				}
			}
			return _getTreeCheckedNodes.apply(data, arguments);
		}
	}

	var _getTreeChangeCheckedNodes = data.getTreeChangeCheckedNodes;
	if (!!_getTreeChangeCheckedNodes) {
		data.getTreeChangeCheckedNodes = function(setting, nodes, results) {
			if (!!nodes && nodes.length > 0) {
				var p = nodes[0].getParentNode();
				if (!!p && !!p.isHidden) {
					return [];
				}
			}
			return _getTreeChangeCheckedNodes.apply(data, arguments);
		}
	}

	var _expandCollapseSonNode = view.expandCollapseSonNode;
	if (!!_expandCollapseSonNode) {
		view.expandCollapseSonNode = function(setting, node, expandFlag, animateFlag, callback) {
			if (!!node && !!node.isHidden) {
				return;
			}
			_expandCollapseSonNode.apply(view, arguments);
		}
	}

	var _setSonNodeCheckBox = view.setSonNodeCheckBox;
	if (!!_setSonNodeCheckBox) {
		view.setSonNodeCheckBox = function(setting, node, value, srcNode) {
			if (!!node && !!node.isHidden) {
				return;
			}
			_setSonNodeCheckBox.apply(view, arguments);
		}
	}

	var _repairParentChkClassWithSelf = view.repairParentChkClassWithSelf;
	if (!!_repairParentChkClassWithSelf) {
		view.repairParentChkClassWithSelf = function(setting, node) {
			if (!!node && !!node.isHidden) {
				return;
			}
			_repairParentChkClassWithSelf.apply(view, arguments);
		}
	}
})(jQuery);
/*! DataTables 1.10.0-beta.2
 * �2008-2014 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     DataTables
 * @description Paginate, search and order HTML tables
 * @version     1.10.0-beta.2
 * @file        jquery.dataTables.js
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @contact     www.sprymedia.co.uk/contact
 * @copyright   Copyright 2008-2014 SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

/*jslint evil: true, undef: true, browser: true */
/*globals $,require,jQuery,define,_selector_run,_selector_opts,_selector_first,_selector_row_indexes,_ext,_Api,_api_register,_api_registerPlural,_re_new_lines,_re_html,_re_formatted_numeric,_re_escape_regex,_empty,_intVal,_numToDecimal,_isNumber,_isHtml,_htmlNumeric,_pluck,_pluck_order,_range,_stripHtml,_unique,_fnBuildAjax,_fnAjaxUpdate,_fnAjaxParameters,_fnAjaxUpdateDraw,_fnAjaxDataSrc,_fnAddColumn,_fnColumnOptions,_fnAdjustColumnSizing,_fnVisibleToColumnIndex,_fnColumnIndexToVisible,_fnVisbleColumns,_fnGetColumns,_fnColumnTypes,_fnApplyColumnDefs,_fnHungarianMap,_fnCamelToHungarian,_fnLanguageCompat,_fnBrowserDetect,_fnAddData,_fnAddTr,_fnNodeToDataIndex,_fnNodeToColumnIndex,_fnGetRowData,_fnGetCellData,_fnSetCellData,_fnSplitObjNotation,_fnGetObjectDataFn,_fnSetObjectDataFn,_fnGetDataMaster,_fnClearTable,_fnDeleteIndex,_fnInvalidateRow,_fnGetRowElements,_fnCreateTr,_fnBuildHead,_fnDrawHead,_fnDraw,_fnReDraw,_fnAddOptionsHtml,_fnDetectHeader,_fnGetUniqueThs,_fnFeatureHtmlFilter,_fnFilterComplete,_fnFilterCustom,_fnFilterColumn,_fnFilter,_fnFilterCreateSearch,_fnEscapeRegex,_fnFilterData,_fnFeatureHtmlInfo,_fnUpdateInfo,_fnInfoMacros,_fnInitialise,_fnInitComplete,_fnLengthChange,_fnFeatureHtmlLength,_fnFeatureHtmlPaginate,_fnPageChange,_fnFeatureHtmlProcessing,_fnProcessingDisplay,_fnFeatureHtmlTable,_fnScrollDraw,_fnApplyToChildren,_fnCalculateColumnWidths,_fnThrottle,_fnConvertToWidth,_fnScrollingWidthAdjust,_fnGetWidestNode,_fnGetMaxLenString,_fnStringToCss,_fnScrollBarWidth,_fnSortFlatten,_fnSort,_fnSortAria,_fnSortListener,_fnSortAttachListener,_fnSortingClasses,_fnSortData,_fnSaveState,_fnLoadState,_fnSettingsFromNode,_fnLog,_fnMap,_fnBindAction,_fnCallbackReg,_fnCallbackFire,_fnLengthOverflow,_fnRenderer,_fnDataSource,_fnRowAttributes*/

(/** @lends <global> */function (window, document, undefined) {

    (function (factory) {
        "use strict";

        // Define as an AMD module if possible
        if (typeof define === 'function' && define.amd) {
            define('datatables', ['jquery'], factory);
        }
        /* Define using browser globals otherwise
	 * Prevent multiple instantiations if the script is loaded twice
	 */
        else if (jQuery && !jQuery.fn.dataTable) {
            factory(jQuery);
        }
    }
    (/** @lends <global> */function ($) {
        "use strict";

        /**
         * DataTables is a plug-in for the jQuery Javascript library. It is a highly
         * flexible tool, based upon the foundations of progressive enhancement,
         * which will add advanced interaction controls to any HTML table. For a
         * full list of features please refer to
         * [DataTables.net](href="http://datatables.net).
         *
         * Note that the `DataTable` object is not a global variable but is aliased
         * to `jQuery.fn.DataTable` and `jQuery.fn.dataTable` through which it may
         * be  accessed.
         *
         *  @class
         *  @param {object} [init={}] Configuration object for DataTables. Options
         *    are defined by {@link DataTable.defaults}
         *  @requires jQuery 1.7+
         *
         *  @example
         *    // Basic initialisation
         *    $(document).ready( function {
	 *      $('#example').dataTable();
	 *    } );
         *
         *  @example
         *    // Initialisation with configuration options - in this case, disable
         *    // pagination and sorting.
         *    $(document).ready( function {
	 *      $('#example').dataTable( {
	 *        "paginate": false,
	 *        "sort": false
	 *      } );
	 *    } );
         */
        var DataTable;


        /*
	 * It is useful to have variables which are scoped locally so only the
	 * DataTables functions can access them and they don't leak into global space.
	 * At the same time these functions are often useful over multiple files in the
	 * core and API, so we list, or at least document, all variables which are used
	 * by DataTables as private variables here. This also ensures that there is no
	 * clashing of variable names and that they can easily referenced for reuse.
	 */


        // Defined else where
        //  _selector_run
        //  _selector_opts
        //  _selector_first
        //  _selector_row_indexes

        var _ext; // DataTable.ext
        var _Api; // DataTable.Api
        var _api_register; // DataTable.Api.register
        var _api_registerPlural; // DataTable.Api.registerPlural

        var _re_dic = {};
        var _re_new_lines = /[\r\n]/g;
        var _re_html = /<.*?>/g;
        var _re_date_start = /^[\d\+\-a-zA-Z]/;

        // Escape regular expression special characters
        var _re_escape_regex = new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-'].join('|\\') + ')', 'g');

        // U+2009 is thin space and U+202F is narrow no-break space, both used in many
        // standards as thousands separators
        var _re_formatted_numeric = /[',$���%\u2009\u202F]/g;


        var _empty = function (d) {
            return !d || d === '-' ? true : false;
        };


        var _intVal = function (s) {
            var integer = parseInt(s, 10);
            return !isNaN(integer) && isFinite(s) ? integer : null;
        };

        var _numToDecimal = function (num, decimalPoint) {
            // Cache created regular expressions for speed as this function is called often
            if (!_re_dic[decimalPoint]) {
                _re_dic[decimalPoint] = new RegExp(_fnEscapeRegex(decimalPoint), 'g');
            }
            return num.replace(/\./g, '').replace(_re_dic[decimalPoint], '.');
        };


        var _isNumber = function (d, decimalPoint, formatted) {
            var strType = typeof d === 'string';

            if (decimalPoint && strType) {
                d = _numToDecimal(d, decimalPoint);
            }

            if (formatted && strType) {
                d = d.replace(_re_formatted_numeric, '');
            }

            return !d || d === '-' || (!isNaN(parseFloat(d)) && isFinite(d));
        };


        // A string without HTML in it can be considered to be HTML still
        var _isHtml = function (d) {
            return !d || typeof d === 'string';
        };


        var _htmlNumeric = function (d, decimalPoint, formatted) {
            if (_empty(d)) {
                return true;
            }

            var html = _isHtml(d);
            return !html ?
                null :
                _isNumber(_stripHtml(d), decimalPoint, formatted) ?
                    true :
                    null;
        };


        var _pluck = function (a, prop, prop2) {
            var out = [];
            var i = 0, ien = a.length;

            // Could have the test in the loop for slightly smaller code, but speed
            // is essential here
            if (prop2 !== undefined) {
                for (; i < ien; i++) {
                    if (a[i] && a[i][prop]) {
                        out.push(a[i][prop][prop2]);
                    }
                }
            }
            else {
                for (; i < ien; i++) {
                    if (a[i]) {
                        out.push(a[i][prop]);
                    }
                }
            }

            return out;
        };


        // Basically the same as _pluck, but rather than looping over `a` we use `order`
        // as the indexes to pick from `a`
        var _pluck_order = function (a, order, prop, prop2) {
            var out = [];
            var i = 0, ien = order.length;

            // Could have the test in the loop for slightly smaller code, but speed
            // is essential here
            if (prop2 !== undefined) {
                for (; i < ien; i++) {
                    out.push(a[order[i]][prop][prop2]);
                }
            }
            else {
                for (; i < ien; i++) {
                    out.push(a[order[i]][prop]);
                }
            }

            return out;
        };


        var _range = function (len, start) {
            var out = [];
            var end;

            if (start === undefined) {
                start = 0;
                end = len;
            }
            else {
                end = start;
                start = len;
            }

            for (var i = start; i < end; i++) {
                out.push(i);
            }

            return out;
        };


        var _stripHtml = function (d) {
            return d.replace(_re_html, '');
        };


        /**
         * Find the unique elements in a source array.
         *
         * @param  {array} src Source array
         * @return {array} Array of unique items
         * @ignore
         */
        var _unique = function (src) {
            // A faster unique method is to use object keys to identify used values,
            // but this doesn't work with arrays or objects, which we must also
            // consider. See jsperf.com/compare-array-unique-versions/4 for more
            // information.
            var
                out = [],
                val,
                i, ien = src.length,
                j, k = 0;

            again: for (i = 0; i < ien; i++) {
                val = src[i];

                for (j = 0; j < k; j++) {
                    if (out[j] === val) {
                        continue again;
                    }
                }

                out.push(val);
                k++;
            }

            return out;
        };


        /**
         * Create a mapping object that allows camel case parameters to be looked up
         * for their Hungarian counterparts. The mapping is stored in a private
         * parameter called `_hungarianMap` which can be accessed on the source object.
         *  @param {object} o
         *  @memberof DataTable#oApi
         */
        function _fnHungarianMap(o) {
            var
                hungarian = 'a aa ai ao as b fn i m o s ',
                match,
                newKey,
                map = {};

            $.each(o, function (key, val) {
                match = key.match(/^([^A-Z]+?)([A-Z])/);

                if (match && hungarian.indexOf(match[1] + ' ') !== -1) {
                    newKey = key.replace(match[0], match[2].toLowerCase());
                    map[newKey] = key;

                    if (match[1] === 'o') {
                        _fnHungarianMap(o[key]);
                    }
                }
            });

            o._hungarianMap = map;
        }


        /**
         * Convert from camel case parameters to Hungarian, based on a Hungarian map
         * created by _fnHungarianMap.
         *  @param {object} src The model object which holds all parameters that can be
         *    mapped.
         *  @param {object} user The object to convert from camel case to Hungarian.
         *  @param {boolean} force When set to `true`, properties which already have a
         *    Hungarian value in the `user` object will be overwritten. Otherwise they
         *    won't be.
         *  @memberof DataTable#oApi
         */
        function _fnCamelToHungarian(src, user, force) {
            if (!src._hungarianMap) {
                _fnHungarianMap(src);
            }

            var hungarianKey;

            $.each(user, function (key, val) {
                hungarianKey = src._hungarianMap[key];

                if (hungarianKey !== undefined && (force || user[hungarianKey] === undefined)) {
                    user[hungarianKey] = user[key];

                    if (hungarianKey.charAt(0) === 'o') {
                        _fnCamelToHungarian(src[hungarianKey], user[key]);
                    }
                }
            });
        }


        /**
         * Language compatibility - when certain options are given, and others aren't, we
         * need to duplicate the values over, in order to provide backwards compatibility
         * with older language files.
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnLanguageCompat(lang) {
            var defaults = DataTable.defaults.oLanguage;
            var zeroRecords = lang.sZeroRecords;

            /* Backwards compatibility - if there is no sEmptyTable given, then use the same as
		 * sZeroRecords - assuming that is given.
		 */
            if (!lang.sEmptyTable && zeroRecords &&
                defaults.sEmptyTable === "No data available in table") {
                _fnMap(lang, lang, 'sZeroRecords', 'sEmptyTable');
            }

            /* Likewise with loading records */
            if (!lang.sLoadingRecords && zeroRecords &&
                defaults.sLoadingRecords === "Loading...") {
                _fnMap(lang, lang, 'sZeroRecords', 'sLoadingRecords');
            }

            // Old parameter name of the thousands separator mapped onto the new
            if (lang.sInfoThousands) {
                lang.sThousands = lang.sInfoThousands;
            }

            var decimal = lang.sDecimal;
            if (decimal) {
                _addNumericSort(decimal);
            }
        }


        /**
         * Map one parameter onto another
         *  @param {object} o Object to map
         *  @param {*} knew The new parameter name
         *  @param {*} old The old parameter name
         */
        var _fnCompatMap = function (o, knew, old) {
            if (o[knew] !== undefined) {
                o[old] = o[knew];
            }
        };


        /**
         * Provide backwards compatibility for the main DT options. Note that the new
         * options are mapped onto the old parameters, so this is an external interface
         * change only.
         *  @param {object} init Object to map
         */
        function _fnCompatOpts(init) {
            _fnCompatMap(init, 'ordering', 'bSort');
            _fnCompatMap(init, 'orderMulti', 'bSortMulti');
            _fnCompatMap(init, 'orderClasses', 'bSortClasses');
            _fnCompatMap(init, 'orderCellsTop', 'bSortCellsTop');
            _fnCompatMap(init, 'order', 'aaSorting');
            _fnCompatMap(init, 'orderFixed', 'aaSortingFixed');
            _fnCompatMap(init, 'paging', 'bPaginate');
            _fnCompatMap(init, 'pagingType', 'sPaginationType');
            _fnCompatMap(init, 'pageLength', 'iDisplayLength');
            _fnCompatMap(init, 'searching', 'bFilter');
        }


        /**
         * Provide backwards compatibility for column options. Note that the new options
         * are mapped onto the old parameters, so this is an external interface change
         * only.
         *  @param {object} init Object to map
         */
        function _fnCompatCols(init) {
            _fnCompatMap(init, 'orderable', 'bSortable');
            _fnCompatMap(init, 'orderData', 'aDataSort');
            _fnCompatMap(init, 'orderSequence', 'asSorting');
            _fnCompatMap(init, 'orderDataType', 'sortDataType');
        }


        /**
         * Browser feature detection for capabilities, quirks
         *  @param {object} settings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnBrowserDetect(settings) {
            var browser = settings.oBrowser;

            // Scrolling feature / quirks detection
            var n = $('<div/>')
                .css({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: 1,
                    width: 1,
                    overflow: 'hidden'
                })
                .append(
                    $('<div/>')
                        .css({
                            position: 'absolute',
                            top: 1,
                            left: 1,
                            width: 100,
                            overflow: 'scroll'
                        })
                        .append(
                            $('<div class="test"/>')
                                .css({
                                    width: '100%',
                                    height: 10
                                })
                        )
                )
                .appendTo('body');

            var test = n.find('.test');

            // IE6/7 will oversize a width 100% element inside a scrolling element, to
            // include the width of the scrollbar, while other browsers ensure the inner
            // element is contained without forcing scrolling
            browser.bScrollOversize = test[0].offsetWidth === 100;

            // In rtl text layout, some browsers (most, but not all) will place the
            // scrollbar on the left, rather than the right.
            browser.bScrollbarLeft = test.offset().left !== 1;

            n.remove();
        }

        /**
         * Add a column to the list used for the table with default values
         *  @param {object} oSettings dataTables settings object
         *  @param {node} nTh The th element for this column
         *  @memberof DataTable#oApi
         */
        function _fnAddColumn(oSettings, nTh) {
            var oDefaults = DataTable.defaults.column;
            var iCol = oSettings.aoColumns.length;
            var oCol = $.extend({}, DataTable.models.oColumn, oDefaults, {
                "sSortingClass": oSettings.oClasses.sSortable,
                "sSortingClassJUI": oSettings.oClasses.sSortJUI,
                "nTh": nTh ? nTh : document.createElement('th'),
                "sTitle": oDefaults.sTitle ? oDefaults.sTitle : nTh ? nTh.innerHTML : '',
                "aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
                "mData": oDefaults.mData ? oDefaults.mData : iCol,
                idx: iCol
            });
            oSettings.aoColumns.push(oCol);

            /* Add a column specific filter */
            if (oSettings.aoPreSearchCols[iCol] === undefined || oSettings.aoPreSearchCols[iCol] === null) {
                oSettings.aoPreSearchCols[iCol] = $.extend(true, {}, DataTable.models.oSearch);
            }
            else {
                var oPre = oSettings.aoPreSearchCols[iCol];

                /* Don't require that the user must specify bRegex, bSmart or bCaseInsensitive */
                if (oPre.bRegex === undefined) {
                    oPre.bRegex = true;
                }

                if (oPre.bSmart === undefined) {
                    oPre.bSmart = true;
                }

                if (oPre.bCaseInsensitive === undefined) {
                    oPre.bCaseInsensitive = true;
                }
            }

            /* Use the column options function to initialise classes etc */
            _fnColumnOptions(oSettings, iCol, null);
        }


        /**
         * Apply options for a column
         *  @param {object} oSettings dataTables settings object
         *  @param {int} iCol column index to consider
         *  @param {object} oOptions object with sType, bVisible and bSearchable etc
         *  @memberof DataTable#oApi
         */
        function _fnColumnOptions(oSettings, iCol, oOptions) {
            var oCol = oSettings.aoColumns[iCol];
            var oClasses = oSettings.oClasses;

            // Try to get width information from the DOM. We can't get it from CSS
            // as we'd need to parse the CSS stylesheet. `width` option can override
            if (!oCol.sWidthOrig) {
                var th = $(oCol.nTh);

                // Width attribute
                oCol.sWidthOrig = th.attr('width') || null;

                // Style attribute
                var t = (th.attr('style') || '').match(/width:\s*(\d+[pxem%])/);
                if (t) {
                    oCol.sWidthOrig = t[1];
                }
            }

            /* User specified column options */
            if (oOptions !== undefined && oOptions !== null) {
                // Backwards compatibility
                _fnCompatCols(oOptions);

                // Map camel case parameters to their Hungarian counterparts
                _fnCamelToHungarian(DataTable.defaults.column, oOptions);

                /* Backwards compatibility for mDataProp */
                if (oOptions.mDataProp !== undefined && !oOptions.mData) {
                    oOptions.mData = oOptions.mDataProp;
                }

                oCol._sManualType = oOptions.sType;

                // `class` is a reserved word in Javascript, so we need to provide
                // the ability to use a valid name for the camel case input
                if (oOptions.className && !oOptions.sClass) {
                    oOptions.sClass = oOptions.className;
                }

                $.extend(oCol, oOptions);
                _fnMap(oCol, oOptions, "sWidth", "sWidthOrig");

                /* iDataSort to be applied (backwards compatibility), but aDataSort will take
			 * priority if defined
			 */
                if (typeof oOptions.iDataSort === 'number') {
                    oCol.aDataSort = [oOptions.iDataSort];
                }
                _fnMap(oCol, oOptions, "aDataSort");
            }

            /* Cache the data get and set functions for speed */
            var mDataSrc = oCol.mData;
            var mData = _fnGetObjectDataFn(mDataSrc);
            var mRender = oCol.mRender ? _fnGetObjectDataFn(oCol.mRender) : null;

            var attrTest = function (src) {
                return typeof src === 'string' && src.indexOf('@') !== -1;
            };
            oCol._bAttrSrc = $.isPlainObject(mDataSrc) && (
                attrTest(mDataSrc.sort) || attrTest(mDataSrc.type) || attrTest(mDataSrc.filter)
            );

            oCol.fnGetData = function (oData, sSpecific) {
                var innerData = mData(oData, sSpecific);

                if (oCol.mRender && (sSpecific && sSpecific !== '')) {
                    return mRender(innerData, sSpecific, oData);
                }
                return innerData;
            };
            oCol.fnSetData = _fnSetObjectDataFn(mDataSrc);

            /* Feature sorting overrides column specific when off */
            if (!oSettings.oFeatures.bSort) {
                oCol.bSortable = false;
            }

            /* Check that the class assignment is correct for sorting */
            var bAsc = $.inArray('asc', oCol.asSorting) !== -1;
            var bDesc = $.inArray('desc', oCol.asSorting) !== -1;
            if (!oCol.bSortable || (!bAsc && !bDesc)) {
                oCol.sSortingClass = oClasses.sSortableNone;
                oCol.sSortingClassJUI = "";
            }
            else if (bAsc && !bDesc) {
                oCol.sSortingClass = oClasses.sSortableAsc;
                oCol.sSortingClassJUI = oClasses.sSortJUIAscAllowed;
            }
            else if (!bAsc && bDesc) {
                oCol.sSortingClass = oClasses.sSortableDesc;
                oCol.sSortingClassJUI = oClasses.sSortJUIDescAllowed;
            }
        }


        /**
         * Adjust the table column widths for new data. Note: you would probably want to
         * do a redraw after calling this function!
         *  @param {object} settings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnAdjustColumnSizing(settings) {
            /* Not interested in doing column width calculation if auto-width is disabled */
            if (settings.oFeatures.bAutoWidth !== false) {
                var columns = settings.aoColumns;

                _fnCalculateColumnWidths(settings);
                for (var i = 0, iLen = columns.length; i < iLen; i++) {
                    columns[i].nTh.style.width = columns[i].sWidth;
                }
            }

            var scroll = settings.oScroll;
            
            if (scroll.sY !== '' || scroll.sX !== '') {
                _fnScrollDraw(settings);
            }

            _fnCallbackFire(settings, null, 'column-sizing', [settings]);
        }


        /**
         * Covert the index of a visible column to the index in the data array (take account
         * of hidden columns)
         *  @param {object} oSettings dataTables settings object
         *  @param {int} iMatch Visible column index to lookup
         *  @returns {int} i the data index
         *  @memberof DataTable#oApi
         */
        function _fnVisibleToColumnIndex(oSettings, iMatch) {
            var aiVis = _fnGetColumns(oSettings, 'bVisible');

            return typeof aiVis[iMatch] === 'number' ?
                aiVis[iMatch] :
                null;
        }


        /**
         * Covert the index of an index in the data array and convert it to the visible
         *   column index (take account of hidden columns)
         *  @param {int} iMatch Column index to lookup
         *  @param {object} oSettings dataTables settings object
         *  @returns {int} i the data index
         *  @memberof DataTable#oApi
         */
        function _fnColumnIndexToVisible(oSettings, iMatch) {
            var aiVis = _fnGetColumns(oSettings, 'bVisible');
            var iPos = $.inArray(iMatch, aiVis);

            return iPos !== -1 ? iPos : null;
        }


        /**
         * Get the number of visible columns
         *  @param {object} oSettings dataTables settings object
         *  @returns {int} i the number of visible columns
         *  @memberof DataTable#oApi
         */
        function _fnVisbleColumns(oSettings) {
            return _fnGetColumns(oSettings, 'bVisible').length;
        }


        /**
         * Get an array of column indexes that match a given property
         *  @param {object} oSettings dataTables settings object
         *  @param {string} sParam Parameter in aoColumns to look for - typically
         *    bVisible or bSearchable
         *  @returns {array} Array of indexes with matched properties
         *  @memberof DataTable#oApi
         */
        function _fnGetColumns(oSettings, sParam) {
            var a = [];

            $.map(oSettings.aoColumns, function (val, i) {
                if (val[sParam]) {
                    a.push(i);
                }
            });

            return a;
        }


        function _fnColumnTypes(settings) {
            var columns = settings.aoColumns;
            var data = settings.aoData;
            var types = DataTable.ext.type.detect;
            var i, ien, j, jen, k, ken;
            var col, cell, detectedType, cache;

            // For each column, spin over the
            for (i = 0, ien = columns.length; i < ien; i++) {
                col = columns[i];
                cache = [];

                if (!col.sType && col._sManualType) {
                    col.sType = col._sManualType;
                }
                else if (!col.sType) {
                    for (j = 0, jen = types.length; j < jen; j++) {
                        for (k = 0, ken = data.length; k < ken; k++) {
                            // Use a cache array so we only need to get the type data
                            // from the formatter once (when using multiple detectors)
                            if (cache[k] === undefined) {
                                cache[k] = _fnGetCellData(settings, k, i, 'type');
                            }

                            detectedType = types[j](cache[k], settings);

                            // Doesn't match, so break early, since this type can't
                            // apply to this column. Also, HTML is a special case since
                            // it is so similar to `string`. Just a single match is
                            // needed for a column to be html type
                            if (!detectedType || detectedType === 'html') {
                                break;
                            }
                        }

                        // Type is valid for all data points in the column - use this
                        // type
                        if (detectedType) {
                            col.sType = detectedType;
                            break;
                        }
                    }

                    // Fall back - if no type was detected, always use string
                    if (!col.sType) {
                        col.sType = 'string';
                    }
                }
            }
        }


        /**
         * Take the column definitions and static columns arrays and calculate how
         * they relate to column indexes. The callback function will then apply the
         * definition found for a column to a suitable configuration object.
         *  @param {object} oSettings dataTables settings object
         *  @param {array} aoColDefs The aoColumnDefs array that is to be applied
         *  @param {array} aoCols The aoColumns array that defines columns individually
         *  @param {function} fn Callback function - takes two parameters, the calculated
         *    column index and the definition for that column.
         *  @memberof DataTable#oApi
         */
        function _fnApplyColumnDefs(oSettings, aoColDefs, aoCols, fn) {
            var i, iLen, j, jLen, k, kLen, def;

            // Column definitions with aTargets
            if (aoColDefs) {
                /* Loop over the definitions array - loop in reverse so first instance has priority */
                for (i = aoColDefs.length - 1; i >= 0; i--) {
                    def = aoColDefs[i];

                    /* Each definition can target multiple columns, as it is an array */
                    var aTargets = def.targets !== undefined ?
                        def.targets :
                        def.aTargets;

                    if (!$.isArray(aTargets)) {
                        aTargets = [aTargets];
                    }

                    for (j = 0, jLen = aTargets.length; j < jLen; j++) {
                        if (typeof aTargets[j] === 'number' && aTargets[j] >= 0) {
                            /* Add columns that we don't yet know about */
                            while (oSettings.aoColumns.length <= aTargets[j]) {
                                _fnAddColumn(oSettings);
                            }

                            /* Integer, basic index */
                            fn(aTargets[j], def);
                        }
                        else if (typeof aTargets[j] === 'number' && aTargets[j] < 0) {
                            /* Negative integer, right to left column counting */
                            fn(oSettings.aoColumns.length + aTargets[j], def);
                        }
                        else if (typeof aTargets[j] === 'string') {
                            /* Class name matching on TH element */
                            for (k = 0, kLen = oSettings.aoColumns.length; k < kLen; k++) {
                                if (aTargets[j] == "_all" ||
                                    $(oSettings.aoColumns[k].nTh).hasClass(aTargets[j])) {
                                    fn(k, def);
                                }
                            }
                        }
                    }
                }
            }

            // Statically defined columns array
            if (aoCols) {
                for (i = 0, iLen = aoCols.length; i < iLen; i++) {
                    fn(i, aoCols[i]);
                }
            }
        }

        /**
         * Add a data array to the table, creating DOM node etc. This is the parallel to
         * _fnGatherData, but for adding rows from a Javascript source, rather than a
         * DOM source.
         *  @param {object} oSettings dataTables settings object
         *  @param {array} aData data array to be added
         *  @param {node} [nTr] TR element to add to the table - optional. If not given,
         *    DataTables will create a row automatically
         *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
         *    if nTr is.
         *  @returns {int} >=0 if successful (index of new aoData entry), -1 if failed
         *  @memberof DataTable#oApi
         */
        function _fnAddData(oSettings, aDataIn, nTr, anTds) {
            /* Create the object for storing information about this new row */
            var iRow = oSettings.aoData.length;
            var oData = $.extend(true, {}, DataTable.models.oRow, {
                src: nTr ? 'dom' : 'data'
            });

            oData._aData = aDataIn;
            oSettings.aoData.push(oData);

            /* Create the cells */
            var nTd, sThisType;
            var columns = oSettings.aoColumns;
            for (var i = 0, iLen = columns.length; i < iLen; i++) {
                // When working with a row, the data source object must be populated. In
                // all other cases, the data source object is already populated, so we
                // don't overwrite it, which might break bindings etc
                if (nTr) {
                    _fnSetCellData(oSettings, iRow, i, _fnGetCellData(oSettings, iRow, i));
                }
                columns[i].sType = null;
            }

            /* Add to the display array */
            oSettings.aiDisplayMaster.push(iRow);

            /* Create the DOM information */
            if (!oSettings.oFeatures.bDeferRender) {
                _fnCreateTr(oSettings, iRow, nTr, anTds);
            }

            return iRow;
        }


        /**
         * Add one or more TR elements to the table. Generally we'd expect to
         * use this for reading data from a DOM sourced table, but it could be
         * used for an TR element. Note that if a TR is given, it is used (i.e.
         * it is not cloned).
         *  @param {object} settings dataTables settings object
         *  @param {array|node|jQuery} trs The TR element(s) to add to the table
         *  @returns {array} Array of indexes for the added rows
         *  @memberof DataTable#oApi
         */
        function _fnAddTr(settings, trs) {
            var row;

            // Allow an individual node to be passed in
            if (!(trs instanceof $)) {
                trs = $(trs);
            }

            return trs.map(function (i, el) {
                row = _fnGetRowElements(settings, el);
                return _fnAddData(settings, row.data, el, row.cells);
            });
        }


        /**
         * Take a TR element and convert it to an index in aoData
         *  @param {object} oSettings dataTables settings object
         *  @param {node} n the TR element to find
         *  @returns {int} index if the node is found, null if not
         *  @memberof DataTable#oApi
         */
        function _fnNodeToDataIndex(oSettings, n) {
            return (n._DT_RowIndex !== undefined) ? n._DT_RowIndex : null;
        }


        /**
         * Take a TD element and convert it into a column data index (not the visible index)
         *  @param {object} oSettings dataTables settings object
         *  @param {int} iRow The row number the TD/TH can be found in
         *  @param {node} n The TD/TH element to find
         *  @returns {int} index if the node is found, -1 if not
         *  @memberof DataTable#oApi
         */
        function _fnNodeToColumnIndex(oSettings, iRow, n) {
            return $.inArray(n, oSettings.aoData[iRow].anCells);
        }


        /**
         * Get an array of data for a given row from the internal data cache
         *  @param {object} oSettings dataTables settings object
         *  @param {int} iRow aoData row id
         *  @param {string} sSpecific data get type ('type' 'filter' 'sort')
         *  @param {array} aiColumns Array of column indexes to get data from
         *  @returns {array} Data array
         *  @memberof DataTable#oApi
         */
        function _fnGetRowData(oSettings, iRow, sSpecific, aiColumns) {
            var out = [];
            for (var i = 0, iLen = aiColumns.length; i < iLen; i++) {
                out.push(_fnGetCellData(oSettings, iRow, aiColumns[i], sSpecific));
            }
            return out;
        }


        /**
         * Get the data for a given cell from the internal cache, taking into account data mapping
         *  @param {object} oSettings dataTables settings object
         *  @param {int} iRow aoData row id
         *  @param {int} iCol Column index
         *  @param {string} sSpecific data get type ('display', 'type' 'filter' 'sort')
         *  @returns {*} Cell data
         *  @memberof DataTable#oApi
         */
        function _fnGetCellData(oSettings, iRow, iCol, sSpecific) {
            var oCol = oSettings.aoColumns[iCol];
            var oData = oSettings.aoData[iRow]._aData;
            var sData = oCol.fnGetData(oData, sSpecific);

            if (sData === undefined) {
                if (oSettings.iDrawError != oSettings.iDraw && oCol.sDefaultContent === null) {
                    _fnLog(oSettings, 0, "Requested unknown parameter " +
                        (typeof oCol.mData == 'function' ? '{function}' : "'" + oCol.mData + "'") +
                        " for row " + iRow, 4);
                    oSettings.iDrawError = oSettings.iDraw;
                }
                return oCol.sDefaultContent;
            }

            /* When the data source is null, we can use default column data */
            if ((sData === oData || sData === null) && oCol.sDefaultContent !== null) {
                sData = oCol.sDefaultContent;
            }
            else if (typeof sData === 'function') {
                // If the data source is a function, then we run it and use the return
                return sData();
            }

            if (sData === null && sSpecific == 'display') {
                return '';
            }
            return sData;
        }


        /**
         * Set the value for a specific cell, into the internal data cache
         *  @param {object} oSettings dataTables settings object
         *  @param {int} iRow aoData row id
         *  @param {int} iCol Column index
         *  @param {*} val Value to set
         *  @memberof DataTable#oApi
         */
        function _fnSetCellData(oSettings, iRow, iCol, val) {
            var oCol = oSettings.aoColumns[iCol];
            var oData = oSettings.aoData[iRow]._aData;

            oCol.fnSetData(oData, val);
        }


        // Private variable that is used to match action syntax in the data property object
        var __reArray = /\[.*?\]$/;
        var __reFn = /\(\)$/;

        /**
         * Split string on periods, taking into account escaped periods
         * @param  {string} str String to split
         * @return {array} Split string
         */
        function _fnSplitObjNotation(str) {
            return $.map(str.match(/(\\.|[^\.])+/g), function (s) {
                return s.replace('\\.', '.');
            });
        }


        /**
         * Return a function that can be used to get data from a source object, taking
         * into account the ability to use nested objects as a source
         *  @param {string|int|function} mSource The data source for the object
         *  @returns {function} Data get function
         *  @memberof DataTable#oApi
         */
        function _fnGetObjectDataFn(mSource) {
            if ($.isPlainObject(mSource)) {
                /* Build an object of get functions, and wrap them in a single call */
                var o = {};
                $.each(mSource, function (key, val) {
                    if (val) {
                        o[key] = _fnGetObjectDataFn(val);
                    }
                });

                return function (data, type, extra) {
                    return o[o[type] !== undefined ? type : '_'](data, type, extra);
                };
            }
            else if (mSource === null) {
                /* Give an empty string for rendering / sorting etc */
                return function (data, type) {
                    return data;
                };
            }
            else if (typeof mSource === 'function') {
                return function (data, type, extra) {
                    return mSource(data, type, extra);
                };
            }
            else if (typeof mSource === 'string' && (mSource.indexOf('.') !== -1 ||
                    mSource.indexOf('[') !== -1 || mSource.indexOf('(') !== -1)) {
                /* If there is a . in the source string then the data source is in a
			 * nested object so we loop over the data for each level to get the next
			 * level down. On each loop we test for undefined, and if found immediately
			 * return. This allows entire objects to be missing and sDefaultContent to
			 * be used if defined, rather than throwing an error
			 */
                var fetchData = function (data, type, src) {
                    var arrayNotation, funcNotation, out, innerSrc;

                    if (src !== "") {
                        var a = _fnSplitObjNotation(src);

                        for (var i = 0, iLen = a.length; i < iLen; i++) {
                            // Check if we are dealing with special notation
                            arrayNotation = a[i].match(__reArray);
                            funcNotation = a[i].match(__reFn);

                            if (arrayNotation) {
                                // Array notation
                                a[i] = a[i].replace(__reArray, '');

                                // Condition allows simply [] to be passed in
                                if (a[i] !== "") {
                                    data = data[a[i]];
                                }
                                out = [];

                                // Get the remainder of the nested object to get
                                a.splice(0, i + 1);
                                innerSrc = a.join('.');

                                // Traverse each entry in the array getting the properties requested
                                for (var j = 0, jLen = data.length; j < jLen; j++) {
                                    out.push(fetchData(data[j], type, innerSrc));
                                }

                                // If a string is given in between the array notation indicators, that
                                // is used to join the strings together, otherwise an array is returned
                                var join = arrayNotation[0].substring(1, arrayNotation[0].length - 1);
                                data = (join === "") ? out : out.join(join);

                                // The inner call to fetchData has already traversed through the remainder
                                // of the source requested, so we exit from the loop
                                break;
                            }
                            else if (funcNotation) {
                                // Function call
                                a[i] = a[i].replace(__reFn, '');
                                data = data[a[i]]();
                                continue;
                            }

                            if (data === null || data[a[i]] === undefined) {
                                return undefined;
                            }
                            data = data[a[i]];
                        }
                    }

                    return data;
                };

                return function (data, type) {
                    return fetchData(data, type, mSource);
                };
            }
            else {
                /* Array or flat object mapping */
                return function (data, type) {
                    return data[mSource];
                };
            }
        }


        /**
         * Return a function that can be used to set data from a source object, taking
         * into account the ability to use nested objects as a source
         *  @param {string|int|function} mSource The data source for the object
         *  @returns {function} Data set function
         *  @memberof DataTable#oApi
         */
        function _fnSetObjectDataFn(mSource) {
            if ($.isPlainObject(mSource)) {
                /* Unlike get, only the underscore (global) option is used for for
			 * setting data since we don't know the type here. This is why an object
			 * option is not documented for `mData` (which is read/write), but it is
			 * for `mRender` which is read only.
			 */
                return _fnSetObjectDataFn(mSource._);
            }
            else if (mSource === null) {
                /* Nothing to do when the data source is null */
                return function (data, val) {
                };
            }
            else if (typeof mSource === 'function') {
                return function (data, val) {
                    mSource(data, 'set', val);
                };
            }
            else if (typeof mSource === 'string' && (mSource.indexOf('.') !== -1 ||
                    mSource.indexOf('[') !== -1 || mSource.indexOf('(') !== -1)) {
                /* Like the get, we need to get data from a nested object */
                var setData = function (data, val, src) {
                    var a = _fnSplitObjNotation(src), b;
                    var aLast = a[a.length - 1];
                    var arrayNotation, funcNotation, o, innerSrc;

                    for (var i = 0, iLen = a.length - 1; i < iLen; i++) {
                        // Check if we are dealing with an array notation request
                        arrayNotation = a[i].match(__reArray);
                        funcNotation = a[i].match(__reFn);

                        if (arrayNotation) {
                            a[i] = a[i].replace(__reArray, '');
                            data[a[i]] = [];

                            // Get the remainder of the nested object to set so we can recurse
                            b = a.slice();
                            b.splice(0, i + 1);
                            innerSrc = b.join('.');

                            // Traverse each entry in the array setting the properties requested
                            for (var j = 0, jLen = val.length; j < jLen; j++) {
                                o = {};
                                setData(o, val[j], innerSrc);
                                data[a[i]].push(o);
                            }

                            // The inner call to setData has already traversed through the remainder
                            // of the source and has set the data, thus we can exit here
                            return;
                        }
                        else if (funcNotation) {
                            // Function call
                            a[i] = a[i].replace(__reFn, '');
                            data = data[a[i]](val);
                        }

                        // If the nested object doesn't currently exist - since we are
                        // trying to set the value - create it
                        if (data[a[i]] === null || data[a[i]] === undefined) {
                            data[a[i]] = {};
                        }
                        data = data[a[i]];
                    }

                    // Last item in the input - i.e, the actual set
                    if (aLast.match(__reFn)) {
                        // Function call
                        data = data[aLast.replace(__reFn, '')](val);
                    }
                    else {
                        // If array notation is used, we just want to strip it and use the property name
                        // and assign the value. If it isn't used, then we get the result we want anyway
                        data[aLast.replace(__reArray, '')] = val;
                    }
                };

                return function (data, val) {
                    return setData(data, val, mSource);
                };
            }
            else {
                /* Array or flat object mapping */
                return function (data, val) {
                    data[mSource] = val;
                };
            }
        }


        /**
         * Return an array with the full table data
         *  @param {object} oSettings dataTables settings object
         *  @returns array {array} aData Master data array
         *  @memberof DataTable#oApi
         */
        function _fnGetDataMaster(settings) {
            return _pluck(settings.aoData, '_aData');
        }


        /**
         * Nuke the table
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnClearTable(settings) {
            settings.aoData.length = 0;
            settings.aiDisplayMaster.length = 0;
            settings.aiDisplay.length = 0;
        }


        /**
         * Take an array of integers (index array) and remove a target integer (value - not
         * the key!)
         *  @param {array} a Index array to target
         *  @param {int} iTarget value to find
         *  @memberof DataTable#oApi
         */
        function _fnDeleteIndex(a, iTarget, splice) {
            var iTargetIndex = -1;

            for (var i = 0, iLen = a.length; i < iLen; i++) {
                if (a[i] == iTarget) {
                    iTargetIndex = i;
                }
                else if (a[i] > iTarget) {
                    a[i]--;
                }
            }

            if (iTargetIndex != -1 && splice === undefined) {
                a.splice(iTargetIndex, 1);
            }
        }


        /**
         * Mark cached data as invalid such that a re-read of the data will occur when
         * the cached data is next requested. Also update from the data source object.
         *
         * @param {object} settings DataTables settings object
         * @param  {int}    rowIdx   Row index to invalidate
         * @memberof DataTable#oApi
         *
         * @todo For the modularisation of v1.11 this will need to become a callback, so
         *   the sort and filter methods can subscribe to it. That will required
         *   initialisation options for sorting, which is why it is not already baked in
         */
        function _fnInvalidateRow(settings, rowIdx, src, column) {
            var row = settings.aoData[rowIdx];
            var i, ien;

            // Are we reading last data from DOM or the data object?
            if (src === 'dom' || ((!src || src === 'auto') && row.src === 'dom')) {
                // Read the data from the DOM
                row._aData = _fnGetRowElements(settings, row.nTr).data;
            }
            else {
                // Reading from data object, update the DOM
                var cells = row.anCells;

                for (i = 0, ien = cells.length; i < ien; i++) {
                    cells[i].innerHTML = _fnGetCellData(settings, rowIdx, i, 'display');
                }
            }

            row._aSortData = null;
            row._aFilterData = null;

            // Invalidate the type for a specific column (if given) or all columns since
            // the data might have changed
            var cols = settings.aoColumns;
            if (column !== undefined) {
                cols[column].sType = null;
            }
            else {
                for (i = 0, ien = cols.length; i < ien; i++) {
                    cols[i].sType = null;
                }
            }

            // Update DataTables special `DT_*` attributes for the row
            _fnRowAttributes(row);
        }


        /**
         * Build a data source object from an HTML row, reading the contents of the
         * cells that are in the row.
         *
         * @param {object} settings DataTables settings object
         * @param {node} TR element from which to read data
         * @returns {object} Object with two parameters: `data` the data read, in
         *   document order, and `cells` and array of nodes (they can be useful to the
         *   caller, so rather than needing a second traversal to get them, just return
         *   them from here).
         * @memberof DataTable#oApi
         */
        function _fnGetRowElements(settings, row) {
            var
                d = [],
                tds = [],
                td = row.firstChild,
                name, col, o, i = 0, contents,
                columns = settings.aoColumns;

            var attr = function (str, data, td) {
                if (typeof str === 'string') {
                    var idx = str.indexOf('@');

                    if (idx !== -1) {
                        var src = str.substring(idx + 1);
                        o['@' + src] = td.getAttribute(src);
                    }
                }
            };

            while (td) {
                name = td.nodeName.toUpperCase();

                if (name == "TD" || name == "TH") {
                    col = columns[i];
                    contents = $.trim(td.innerHTML);

                    if (col && col._bAttrSrc) {
                        o = {
                            display: contents
                        };

                        attr(col.mData.sort, o, td);
                        attr(col.mData.type, o, td);
                        attr(col.mData.filter, o, td);

                        d.push(o);
                    }
                    else {
                        d.push(contents);
                    }

                    tds.push(td);
                    i++;
                }

                td = td.nextSibling;
            }

            return {
                data: d,
                cells: tds
            };
        }

        /**
         * Create a new TR element (and it's TD children) for a row
         *  @param {object} oSettings dataTables settings object
         *  @param {int} iRow Row to consider
         *  @param {node} [nTrIn] TR element to add to the table - optional. If not given,
         *    DataTables will create a row automatically
         *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
         *    if nTr is.
         *  @memberof DataTable#oApi
         */
        function _fnCreateTr(oSettings, iRow, nTrIn, anTds) {
            var
                row = oSettings.aoData[iRow],
                rowData = row._aData,
                cells = [],
                nTr, nTd, oCol,
                i, iLen;

            if (row.nTr === null) {
                nTr = nTrIn || document.createElement('tr');

                row.nTr = nTr;
                row.anCells = cells;

                /* Use a private property on the node to allow reserve mapping from the node
			 * to the aoData array for fast look up
			 */
                nTr._DT_RowIndex = iRow;

                /* Special parameters can be given by the data source to be used on the row */
                _fnRowAttributes(row);

                /* Process each column */
                for (i = 0, iLen = oSettings.aoColumns.length; i < iLen; i++) {
                    oCol = oSettings.aoColumns[i];

                    nTd = nTrIn ? anTds[i] : document.createElement(oCol.sCellType);
                    cells.push(nTd);

                    // Need to create the HTML if new, or if a rendering function is defined
                    if (!nTrIn || oCol.mRender || oCol.mData !== i) {
                        nTd.innerHTML = _fnGetCellData(oSettings, iRow, i, 'display');
                    }

                    /* Add user defined class */
                    if (oCol.sClass) {
                        nTd.className += ' ' + oCol.sClass;
                    }

                    // Visibility - add or remove as required
                    if (oCol.bVisible && !nTrIn) {
                        nTr.appendChild(nTd);
                    }
                    else if (!oCol.bVisible && nTrIn) {
                        nTd.parentNode.removeChild(nTd);
                    }

                    if (oCol.fnCreatedCell) {
                        oCol.fnCreatedCell.call(oSettings.oInstance,
                            nTd, _fnGetCellData(oSettings, iRow, i, 'display'), rowData, iRow, i
                        );
                    }
                }

                _fnCallbackFire(oSettings, 'aoRowCreatedCallback', null, [nTr, rowData, iRow]);
            }
        }


        /**
         * Add attributes to a row based on the special `DT_*` parameters in a data
         * source object.
         *  @param {object} DataTables row object for the row to be modified
         *  @memberof DataTable#oApi
         */
        function _fnRowAttributes(row) {
            var tr = row.nTr;
            var data = row._aData;

            if (tr) {
                if (data.DT_RowId) {
                    tr.id = data.DT_RowId;
                }

                if (data.DT_RowClass) {
                    // Remove any classes added by DT_RowClass before
                    var a = data.DT_RowClass.split(' ');
                    row.__rowc = row.__rowc ?
                        _unique(row.__rowc.concat(a)) :
                        a;

                    $(tr)
                        .removeClass(row.__rowc.join(' '))
                        .addClass(data.DT_RowClass);
                }

                if (data.DT_RowData) {
                    $(tr).data(data.DT_RowData);
                }
            }
        }


        /**
         * Create the HTML header for the table
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnBuildHead(oSettings) {
            var i, ien, cell, row, column;
            var thead = oSettings.nTHead;
            var tfoot = oSettings.nTFoot;
            var createHeader = $('th, td', thead).length === 0;
            var classes = oSettings.oClasses;
            var columns = oSettings.aoColumns;

            if (createHeader) {
                row = $('<tr/>').appendTo(thead);
            }

            for (i = 0, ien = columns.length; i < ien; i++) {
                column = columns[i];
                cell = $(column.nTh).addClass(column.sClass);

                if (createHeader) {
                    cell.appendTo(row);
                }

                // 1.11 move into sorting
                if (oSettings.oFeatures.bSort) {
                    cell.addClass(column.sSortingClass);

                    if (column.bSortable !== false) {
                        cell
                            .attr('tabindex', oSettings.iTabIndex)
                            .attr('aria-controls', oSettings.sTableId);

                        _fnSortAttachListener(oSettings, column.nTh, i);
                    }
                }

                if (column.sTitle != cell.html()) {
                    cell.html(column.sTitle);
                }

                _fnRenderer(oSettings, 'header')(
                    oSettings, cell, column, classes
                );
            }

            if (createHeader) {
                _fnDetectHeader(oSettings.aoHeader, thead);
            }

            /* ARIA role for the rows */
            $(thead).find('>tr').attr('role', 'row');

            /* Deal with the footer - add classes if required */
            $(thead).find('>tr>th, >tr>td').addClass(classes.sHeaderTH);
            $(tfoot).find('>tr>th, >tr>td').addClass(classes.sFooterTH);

            // Cache the footer cells. Note that we only take the cells from the first
            // row in the footer. If there is more than one row the user wants to
            // interact with, they need to use the table().foot() method. Note also this
            // allows cells to be used for multiple columns using colspan
            if (tfoot !== null) {
                var cells = oSettings.aoFooter[0];

                for (i = 0, ien = cells.length; i < ien; i++) {
                    column = columns[i];
                    column.nTf = cells[i].cell;

                    if (column.sClass) {
                        $(column.nTf).addClass(column.sClass);
                    }
                }
            }
        }


        /**
         * Draw the header (or footer) element based on the column visibility states. The
         * methodology here is to use the layout array from _fnDetectHeader, modified for
         * the instantaneous column visibility, to construct the new layout. The grid is
         * traversed over cell at a time in a rows x columns grid fashion, although each
         * cell insert can cover multiple elements in the grid - which is tracks using the
         * aApplied array. Cell inserts in the grid will only occur where there isn't
         * already a cell in that position.
         *  @param {object} oSettings dataTables settings object
         *  @param array {objects} aoSource Layout array from _fnDetectHeader
         *  @param {boolean} [bIncludeHidden=false] If true then include the hidden columns in the calc,
         *  @memberof DataTable#oApi
         */
        function _fnDrawHead(oSettings, aoSource, bIncludeHidden) {
            var i, iLen, j, jLen, k, kLen, n, nLocalTr;
            var aoLocal = [];
            var aApplied = [];
            var iColumns = oSettings.aoColumns.length;
            var iRowspan, iColspan;

            if (!aoSource) {
                return;
            }

            if (bIncludeHidden === undefined) {
                bIncludeHidden = false;
            }

            /* Make a copy of the master layout array, but without the visible columns in it */
            for (i = 0, iLen = aoSource.length; i < iLen; i++) {
                aoLocal[i] = aoSource[i].slice();
                aoLocal[i].nTr = aoSource[i].nTr;

                /* Remove any columns which are currently hidden */
                for (j = iColumns - 1; j >= 0; j--) {
                    if (!oSettings.aoColumns[j].bVisible && !bIncludeHidden) {
                        aoLocal[i].splice(j, 1);
                    }
                }

                /* Prep the applied array - it needs an element for each row */
                aApplied.push([]);
            }

            for (i = 0, iLen = aoLocal.length; i < iLen; i++) {
                nLocalTr = aoLocal[i].nTr;

                /* All cells are going to be replaced, so empty out the row */
                if (nLocalTr) {
                    while ((n = nLocalTr.firstChild)) {
                        nLocalTr.removeChild(n);
                    }
                }

                for (j = 0, jLen = aoLocal[i].length; j < jLen; j++) {
                    iRowspan = 1;
                    iColspan = 1;

                    /* Check to see if there is already a cell (row/colspan) covering our target
				 * insert point. If there is, then there is nothing to do.
				 */
                    if (aApplied[i][j] === undefined) {
                        nLocalTr.appendChild(aoLocal[i][j].cell);
                        aApplied[i][j] = 1;

                        /* Expand the cell to cover as many rows as needed */
                        while (aoLocal[i + iRowspan] !== undefined &&
                        aoLocal[i][j].cell == aoLocal[i + iRowspan][j].cell) {
                            aApplied[i + iRowspan][j] = 1;
                            iRowspan++;
                        }

                        /* Expand the cell to cover as many columns as needed */
                        while (aoLocal[i][j + iColspan] !== undefined &&
                        aoLocal[i][j].cell == aoLocal[i][j + iColspan].cell) {
                            /* Must update the applied array over the rows for the columns */
                            for (k = 0; k < iRowspan; k++) {
                                aApplied[i + k][j + iColspan] = 1;
                            }
                            iColspan++;
                        }

                        /* Do the actual expansion in the DOM */
                        $(aoLocal[i][j].cell)
                            .attr('rowspan', iRowspan)
                            .attr('colspan', iColspan);
                    }
                }
            }
        }


        /**
         * Insert the required TR nodes into the table for display
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnDraw(oSettings) {
            /* Provide a pre-callback function which can be used to cancel the draw is false is returned */
            var aPreDraw = _fnCallbackFire(oSettings, 'aoPreDrawCallback', 'preDraw', [oSettings]);
            if ($.inArray(false, aPreDraw) !== -1) {
                _fnProcessingDisplay(oSettings, false);
                return;
            }

            var i, iLen, n;
            var anRows = [];
            var iRowCount = 0;
            var asStripeClasses = oSettings.asStripeClasses;
            var iStripes = asStripeClasses.length;
            var iOpenRows = oSettings.aoOpenRows.length;
            var oLang = oSettings.oLanguage;
            var iInitDisplayStart = oSettings.iInitDisplayStart;
            var bServerSide = _fnDataSource(oSettings) == 'ssp';
            var aiDisplay = oSettings.aiDisplay;

            oSettings.bDrawing = true;

            /* Check and see if we have an initial draw position from state saving */
            if (iInitDisplayStart !== undefined && iInitDisplayStart !== -1) {
                oSettings._iDisplayStart = bServerSide ?
                    iInitDisplayStart :
                    iInitDisplayStart >= oSettings.fnRecordsDisplay() ?
                        0 :
                        iInitDisplayStart;

                oSettings.iInitDisplayStart = -1;
            }

            var iDisplayStart = oSettings._iDisplayStart;
            var iDisplayEnd = oSettings.fnDisplayEnd();

            /* Server-side processing draw intercept */
            if (oSettings.bDeferLoading) {
                oSettings.bDeferLoading = false;
                oSettings.iDraw++;
                _fnProcessingDisplay(oSettings, false);
            }
            else if (!bServerSide) {
                oSettings.iDraw++;
            }
            else if (!oSettings.bDestroying && !_fnAjaxUpdate(oSettings)) {
                return;
            }

            if (aiDisplay.length !== 0) {
                var iStart = bServerSide ? 0 : iDisplayStart;
                var iEnd = bServerSide ? oSettings.aoData.length : iDisplayEnd;

                for (var j = iStart; j < iEnd; j++) {
                    var iDataIndex = aiDisplay[j];
                    var aoData = oSettings.aoData[iDataIndex];
                    if (aoData.nTr === null) {
                        _fnCreateTr(oSettings, iDataIndex);
                    }

                    var nRow = aoData.nTr;

                    /* Remove the old striping classes and then add the new one */
                    if (iStripes !== 0) {
                        var sStripe = asStripeClasses[iRowCount % iStripes];
                        if (aoData._sRowStripe != sStripe) {
                            $(nRow).removeClass(aoData._sRowStripe).addClass(sStripe);
                            aoData._sRowStripe = sStripe;
                        }
                    }

                    /* Row callback functions - might want to manipulate the row */
                    _fnCallbackFire(oSettings, 'aoRowCallback', null,
                        [nRow, aoData._aData, iRowCount, j]);

                    anRows.push(nRow);
                    iRowCount++;
                }
            }
            else {
                /* Table is empty - create a row with an empty message in it */
                var sZero = oLang.sZeroRecords;
                if (oSettings.iDraw == 1 && _fnDataSource(oSettings) == 'ajax') {
                    sZero = oLang.sLoadingRecords;
                }
                else if (oLang.sEmptyTable && oSettings.fnRecordsTotal() === 0) {
                    sZero = oLang.sEmptyTable;
                }

                anRows[0] = $('<tr/>', {'class': iStripes ? asStripeClasses[0] : ''})
                    .append($('<td />', {
                        'valign': 'top',
                        'colSpan': _fnVisbleColumns(oSettings),
                        'class': oSettings.oClasses.sRowEmpty
                    }).html(sZero))[0];
            }

            /* Header and footer callbacks */
            _fnCallbackFire(oSettings, 'aoHeaderCallback', 'header', [$(oSettings.nTHead).children('tr')[0],
                _fnGetDataMaster(oSettings), iDisplayStart, iDisplayEnd, aiDisplay]);

            _fnCallbackFire(oSettings, 'aoFooterCallback', 'footer', [$(oSettings.nTFoot).children('tr')[0],
                _fnGetDataMaster(oSettings), iDisplayStart, iDisplayEnd, aiDisplay]);

            var body = $(oSettings.nTBody);

            body.children().detach();
            body.append($(anRows));

            /* Call all required callback functions for the end of a draw */
            _fnCallbackFire(oSettings, 'aoDrawCallback', 'draw', [oSettings]);

            /* Draw is complete, sorting and filtering must be as well */
            oSettings.bSorted = false;
            oSettings.bFiltered = false;
            oSettings.bDrawing = false;

            layer.closeAll('loading');
        }


        /**
         * Redraw the table - taking account of the various features which are enabled
         *  @param {object} oSettings dataTables settings object
         *  @param {boolean} [holdPosition] Keep the current paging position. By default
         *    the paging is reset to the first page
         *  @memberof DataTable#oApi
         */
        function _fnReDraw(settings, holdPosition) {
            var
                features = settings.oFeatures,
                sort = features.bSort,
                filter = features.bFilter;

            if (sort) {
                _fnSort(settings);
            }

            if (filter) {
                _fnFilterComplete(settings, settings.oPreviousSearch);
            }
            else {
                // No filtering, so we want to just use the display master
                settings.aiDisplay = settings.aiDisplayMaster.slice();
            }

            if (holdPosition !== true) {
                settings._iDisplayStart = 0;
            }

            _fnDraw(settings);
        }


        /**
         * Add the options to the page HTML for the table
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnAddOptionsHtml(oSettings) {
            var classes = oSettings.oClasses;
            var table = $(oSettings.nTable);
            var holding = $('<div/>').insertBefore(table); // Holding element for speed
            var features = oSettings.oFeatures;
 
            // All DataTables are wrapped in a div ---pengwl
            var insert = $('<div/>', {
                role: 'grid',
                id: oSettings.sTableId + '_wrapper',
                'class': classes.sWrapper + (oSettings.nTFoot ? '' : ' ' + classes.sNoFooter)
            });

            oSettings.nTableWrapper = insert[0];
            oSettings.nTableReinsertBefore = oSettings.nTable.nextSibling;

            /* Loop over the user set positioning and place the elements as needed */
            var aDom = oSettings.sDom.split('');
            var featureNode, cOption, nNewNode, cNext, sAttr, j;
            for (var i = 0; i < aDom.length; i++) {
                featureNode = null;
                cOption = aDom[i];

                if (cOption == '<') {
                    /* New container div */
                    nNewNode = $('<div/>')[0];

                    /* Check to see if we should append an id and/or a class name to the container */
                    cNext = aDom[i + 1];
                    if (cNext == "'" || cNext == '"') {
                        sAttr = "";
                        j = 2;
                        while (aDom[i + j] != cNext) {
                            sAttr += aDom[i + j];
                            j++;
                        }

                        /* Replace jQuery UI constants @todo depreciated */
                        if (sAttr == "H") {
                            sAttr = classes.sJUIHeader;
                        }
                        else if (sAttr == "F") {
                            sAttr = classes.sJUIFooter;
                        }

                        /* The attribute can be in the format of "#id.class", "#id" or "class" This logic
					 * breaks the string into parts and applies them as needed
					 */
                        if (sAttr.indexOf('.') != -1) {
                            var aSplit = sAttr.split('.');
                            nNewNode.id = aSplit[0].substr(1, aSplit[0].length - 1);
                            nNewNode.className = aSplit[1];
                        }
                        else if (sAttr.charAt(0) == "#") {
                            nNewNode.id = sAttr.substr(1, sAttr.length - 1);
                        }
                        else {
                            nNewNode.className = sAttr;
                        }

                        i += j;
                        /* Move along the position array */
                    }

                    insert.append(nNewNode);
                    insert = $(nNewNode);
                }
                else if (cOption == '>') {
                    /* End container div */
                    insert = insert.parent();
                }
                // @todo Move options into their own plugins?
                else if (cOption == 'l' && features.bPaginate && features.bLengthChange) {
                    /* Length */
                    featureNode = _fnFeatureHtmlLength(oSettings);
                }
                else if (cOption == 'f' && features.bFilter) {
                    /* Filter */
                    featureNode = _fnFeatureHtmlFilter(oSettings);
                }
                else if (cOption == 'r' && features.bProcessing) {
                    /* pRocessing */
                    featureNode = _fnFeatureHtmlProcessing(oSettings);
                }
                else if (cOption == 't') {
                    /* Table */
                    featureNode = _fnFeatureHtmlTable(oSettings);
                }
                else if (cOption == 'i' && features.bInfo) {
                    /* Info */
                    featureNode = _fnFeatureHtmlInfo(oSettings);
                }
                else if (cOption == 'p' && features.bPaginate) {
                    /* Pagination */
                    featureNode = _fnFeatureHtmlPaginate(oSettings);
                }
                else if (DataTable.ext.feature.length !== 0) {
                    /* Plug-in features */
                    var aoFeatures = DataTable.ext.feature;
                    for (var k = 0, kLen = aoFeatures.length; k < kLen; k++) {
                        if (cOption == aoFeatures[k].cFeature) {
                            featureNode = aoFeatures[k].fnInit(oSettings);
                            break;
                        }
                    }
                }

                /* Add to the 2D features array */
                if (featureNode) {
                    var aanFeatures = oSettings.aanFeatures;

                    if (!aanFeatures[cOption]) {
                        aanFeatures[cOption] = [];
                    }

                    aanFeatures[cOption].push(featureNode);
                    insert.append(featureNode);
                }
            }

            /* Built our DOM structure - replace the holding div with what we want */
            holding.replaceWith(insert);
        }


        /**
         * Use the DOM source to create up an array of header cells. The idea here is to
         * create a layout grid (array) of rows x columns, which contains a reference
         * to the cell that that point in the grid (regardless of col/rowspan), such that
         * any column / row could be removed and the new grid constructed
         *  @param array {object} aLayout Array to store the calculated layout in
         *  @param {node} nThead The header/footer element for the table
         *  @memberof DataTable#oApi
         */
        function _fnDetectHeader(aLayout, nThead) {
            var nTrs = $(nThead).children('tr');
            var nTr, nCell;
            var i, k, l, iLen, jLen, iColShifted, iColumn, iColspan, iRowspan;
            var bUnique;
            var fnShiftCol = function (a, i, j) {
                var k = a[i];
                while (k[j]) {
                    j++;
                }
                return j;
            };

            aLayout.splice(0, aLayout.length);

            /* We know how many rows there are in the layout - so prep it */
            for (i = 0, iLen = nTrs.length; i < iLen; i++) {
                aLayout.push([]);
            }

            /* Calculate a layout array */
            for (i = 0, iLen = nTrs.length; i < iLen; i++) {
                nTr = nTrs[i];
                iColumn = 0;

                /* For every cell in the row... */
                nCell = nTr.firstChild;
                while (nCell) {
                    if (nCell.nodeName.toUpperCase() == "TD" ||
                        nCell.nodeName.toUpperCase() == "TH") {
                        /* Get the col and rowspan attributes from the DOM and sanitise them */
                        iColspan = nCell.getAttribute('colspan') * 1;
                        iRowspan = nCell.getAttribute('rowspan') * 1;
                        iColspan = (!iColspan || iColspan === 0 || iColspan === 1) ? 1 : iColspan;
                        iRowspan = (!iRowspan || iRowspan === 0 || iRowspan === 1) ? 1 : iRowspan;

                        /* There might be colspan cells already in this row, so shift our target
					 * accordingly
					 */
                        iColShifted = fnShiftCol(aLayout, i, iColumn);

                        /* Cache calculation for unique columns */
                        bUnique = iColspan === 1 ? true : false;

                        /* If there is col / rowspan, copy the information into the layout grid */
                        for (l = 0; l < iColspan; l++) {
                            for (k = 0; k < iRowspan; k++) {
                                aLayout[i + k][iColShifted + l] = {
                                    "cell": nCell,
                                    "unique": bUnique
                                };
                                aLayout[i + k].nTr = nTr;
                            }
                        }
                    }
                    nCell = nCell.nextSibling;
                }
            }
        }


        /**
         * Get an array of unique th elements, one for each column
         *  @param {object} oSettings dataTables settings object
         *  @param {node} nHeader automatically detect the layout from this node - optional
         *  @param {array} aLayout thead/tfoot layout from _fnDetectHeader - optional
         *  @returns array {node} aReturn list of unique th's
         *  @memberof DataTable#oApi
         */
        function _fnGetUniqueThs(oSettings, nHeader, aLayout) {
            var aReturn = [];
            if (!aLayout) {
                aLayout = oSettings.aoHeader;
                if (nHeader) {
                    aLayout = [];
                    _fnDetectHeader(aLayout, nHeader);
                }
            }

            for (var i = 0, iLen = aLayout.length; i < iLen; i++) {
                for (var j = 0, jLen = aLayout[i].length; j < jLen; j++) {
                    if (aLayout[i][j].unique &&
                        (!aReturn[j] || !oSettings.bSortCellsTop)) {
                        aReturn[j] = aLayout[i][j].cell;
                    }
                }
            }

            return aReturn;
        }


        /**
         * Create an Ajax call based on the table's settings, taking into account that
         * parameters can have multiple forms, and backwards compatibility.
         *
         * @param {object} oSettings dataTables settings object
         * @param {array} data Data to send to the server, required by
         *     DataTables - may be augmented by developer callbacks
         * @param {function} fn Callback function to run when data is obtained
         */
        function _fnBuildAjax(oSettings, data, fn) {
            // Compatibility with 1.9-, allow fnServerData and event to manipulate
            _fnCallbackFire(oSettings, 'aoServerParams', 'serverParams', [data]);

            // Convert to object based for 1.10+ if using the old scheme
            if (data && data.__legacy) {
                var tmp = {};
                var rbracket = /(.*?)\[\]$/;

                $.each(data, function (key, val) {
                    var match = val.name.match(rbracket);

                    if (match) {
                        // Support for arrays
                        var name = match[0];

                        if (!tmp[name]) {
                            tmp[name] = [];
                        }
                        tmp[name].push(val.value);
                    }
                    else {
                        tmp[val.name] = val.value;
                    }
                });
                data = tmp;
            }

            var ajaxData;
            var ajax = oSettings.ajax;
            var instance = oSettings.oInstance;

            if ($.isPlainObject(ajax) && ajax.data) {
                ajaxData = ajax.data;

                var newData = $.isFunction(ajaxData) ?
                    ajaxData(data) :  // fn can manipulate data or return an object
                    ajaxData;           // object or array to merge

                // If the function returned an object, use that alone
                data = $.isFunction(ajaxData) && newData ?
                    newData :
                    $.extend(true, data, newData);

                // Remove the data property as we've resolved it already and don't want
                // jQuery to do it again (it is restored at the end of the function)
                delete ajax.data;
            }

            var baseAjax = {
                "data": data,
                "success": function (json) {
                    var error = json.error || json.sError;
                    if (error) {
                        oSettings.oApi._fnLog(oSettings, 0, error);
                    }

                    oSettings.json = json;
                    _fnCallbackFire(oSettings, null, 'xhr', [oSettings, json]);
                    fn(json);
                },
                "dataType": "json",
                "cache": false,
                "type": oSettings.sServerMethod,
                "error": function (xhr, error, thrown) {
                    var log = oSettings.oApi._fnLog;

                    if (error == "parsererror") {
                        log(oSettings, 0, 'Invalid JSON response', 1);
                    }
                    else {
                        log(oSettings, 0, 'Ajax error', 7);
                    }
                }
            };

            if (oSettings.fnServerData) {
                // DataTables 1.9- compatibility
                oSettings.fnServerData.call(instance,
                    oSettings.sAjaxSource, data, fn, oSettings
                );
            }
            else if (oSettings.sAjaxSource || typeof ajax === 'string') {
                // DataTables 1.9- compatibility
                oSettings.jqXHR = $.ajax($.extend(baseAjax, {
                    url: ajax || oSettings.sAjaxSource
                }));
            }
            else if ($.isFunction(ajax)) {
                // Is a function - let the caller define what needs to be done
                oSettings.jqXHR = ajax.call(instance, data, fn, oSettings);
            }
            else {
                // Object to extend the base settings
                oSettings.jqXHR = $.ajax($.extend(baseAjax, ajax));

                // Restore for next time around
                ajax.data = ajaxData;
            }
        }


        /**
         * Update the table using an Ajax call
         *  @param {object} oSettings dataTables settings object
         *  @returns {boolean} Block the table drawing or not
         *  @memberof DataTable#oApi
         */
        function _fnAjaxUpdate(oSettings) {
            if (oSettings.bAjaxDataGet) {
                oSettings.iDraw++;
                _fnProcessingDisplay(oSettings, true);
                var iColumns = oSettings.aoColumns.length;
                var aoData = _fnAjaxParameters(oSettings);

                _fnBuildAjax(oSettings, aoData, function (json) {
                    _fnAjaxUpdateDraw(oSettings, json);
                }, oSettings);

                return false;
            }
            return true;
        }


        /**
         * Build up the parameters in an object needed for a server-side processing
         * request. Note that this is basically done twice, is different ways - a modern
         * method which is used by default in DataTables 1.10 which uses objects and
         * arrays, or the 1.9- method with is name / value pairs. 1.9 method is used if
         * the sAjaxSource option is used in the initialisation, or the legacyAjax
         * option is set.
         *  @param {object} oSettings dataTables settings object
         *  @returns {bool} block the table drawing or not
         *  @memberof DataTable#oApi
         */
        function _fnAjaxParameters(settings) {
            var
                columns = settings.aoColumns,
                columnCount = columns.length,
                features = settings.oFeatures,
                preSearch = settings.oPreviousSearch,
                preColSearch = settings.aoPreSearchCols,
                i, data = [], dataProp, column, columnSearch,
                sort = _fnSortFlatten(settings),
                displayStart = settings._iDisplayStart,
                displayLength = features.bPaginate !== false ?
                    settings._iDisplayLength :
                    -1;

                // calc page pengwl 2020-02-06
                var page = displayStart/displayLength + 1;

            var param = function (name, value) {
                data.push({'name': name, 'value': value});
            };

            // DataTables 1.9- compatible method
            param('sEcho', settings.iDraw);
            param('iColumns', columnCount);
            param('sColumns', _pluck(columns, 'sName').join(','));
            param('iDisplayStart', displayStart);
            param('iDisplayLength', displayLength);

            // DataTables 1.10+ method
            var d = {
                draw: settings.iDraw,
                page: page,
                // columns: [],
                // order: [],
                start: displayStart,
                length: displayLength,
                search: {
                    value: preSearch.sSearch,
                    regex: preSearch.bRegex
                }
            };

            // for (i = 0; i < columnCount; i++) {
            //     column = columns[i];
            //     columnSearch = preColSearch[i];
            //     dataProp = typeof column.mData == "function" ? 'function' : column.mData;

            //     d.columns.push({
            //         data: dataProp,
            //         name: column.sName,
            //         searchable: column.bSearchable,
            //         orderable: column.bSortable,
            //         search: {
            //             value: columnSearch.sSearch,
            //             regex: columnSearch.bRegex
            //         }
            //     });

            //     param("mDataProp_" + i, dataProp);

            //     if (features.bFilter) {
            //         param('sSearch_' + i, columnSearch.sSearch);
            //         param('bRegex_' + i, columnSearch.bRegex);
            //         param('bSearchable_' + i, column.bSearchable);
            //     }

            //     if (features.bSort) {
            //         param('bSortable_' + i, column.bSortable);
            //     }
            // }

            // $.each(sort, function (i, val) {
            //     d.order.push({column: val.col, dir: val.dir});

            //     param('iSortCol_' + i, val.col);
            //     param('sSortDir_' + i, val.dir);
            // });

            if (features.bFilter) {
                param('sSearch', preSearch.sSearch);
                param('bRegex', preSearch.bRegex);
            }

            if (features.bSort) {
                param('iSortingCols', sort.length);
            }

            data.__legacy = true;

            // If the legacy.ajax parameter is null, then we automatically decide which
            // form to use, based on sAjaxSource
            var legacy = DataTable.ext.legacy.ajax;
            if (legacy === null) {
                return settings.sAjaxSource ? data : d;
            }

            // Otherwise, if legacy has been specified then we use that to decide on the
            // form
            return legacy ? data : d;
        }


        /**
         * Data the data from the server (nuking the old) and redraw the table
         *  @param {object} oSettings dataTables settings object
         *  @param {object} json json data return from the server.
         *  @param {string} json.sEcho Tracking flag for DataTables to match requests
         *  @param {int} json.iTotalRecords Number of records in the data set, not accounting for filtering
         *  @param {int} json.iTotalDisplayRecords Number of records in the data set, accounting for filtering
         *  @param {array} json.aaData The data to display on this page
         *  @param {string} [json.sColumns] Column ordering (sName, comma separated)
         *  @memberof DataTable#oApi
         */
        function _fnAjaxUpdateDraw(settings, json) {
            // v1.10 uses camelCase variables, while 1.9 uses Hungarian notation.
            // Support both
            var compat = function (old, modern) {
                return json[old] !== undefined ? json[old] : json[modern];
            };

            var draw = compat('sEcho', 'draw');
            var recordsTotal = compat('iTotalRecords', 'recordsTotal');
            var rocordsFiltered = compat('iTotalDisplayRecords', 'recordsFiltered');

            if (draw) {
                // Protect against out of sequence returns
                if (draw * 1 < settings.iDraw) {
                    return;
                }
                settings.iDraw = draw * 1;
            }

            _fnClearTable(settings);
            settings._iRecordsTotal = parseInt(recordsTotal, 10);
            settings._iRecordsDisplay = parseInt(rocordsFiltered, 10);

            var data = _fnAjaxDataSrc(settings, json);
            for (var i = 0, ien = data.length; i < ien; i++) {
                _fnAddData(settings, data[i]);
            }
            settings.aiDisplay = settings.aiDisplayMaster.slice();

            settings.bAjaxDataGet = false;
            _fnDraw(settings);

            if (!settings._bInitComplete) {
                _fnInitComplete(settings, json);
            }

            settings.bAjaxDataGet = true;
            _fnProcessingDisplay(settings, false);
        }


        /**
         * Get the data from the JSON data source to use for drawing a table. Using
         * `_fnGetObjectDataFn` allows the data to be sourced from a property of the
         * source object, or from a processing function.
         *  @param {object} oSettings dataTables settings object
         *  @param  {object} json Data source object / array from the server
         *  @return {array} Array of data to use
         */
        function _fnAjaxDataSrc(oSettings, json) {
            var dataSrc = $.isPlainObject(oSettings.ajax) && oSettings.ajax.dataSrc !== undefined ?
                oSettings.ajax.dataSrc :
                oSettings.sAjaxDataProp; // Compatibility with 1.9-.

            // Compatibility with 1.9-. In order to read from aaData, check if the
            // default has been changed, if not, check for aaData
            if (dataSrc === 'data') {
                return json.aaData || json[dataSrc];
            }

            return dataSrc !== "" ?
                _fnGetObjectDataFn(dataSrc)(json) :
                json;
        }


        /**
         * Generate the node required for filtering text
         *  @returns {node} Filter control element
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnFeatureHtmlFilter(settings) {
            var classes = settings.oClasses;
            var tableId = settings.sTableId;
            var previousSearch = settings.oPreviousSearch;
            var features = settings.aanFeatures;
            var input = '<input type="search" class="' + classes.sFilterInput + '"/>';

            var str = settings.oLanguage.sSearch;
            str = str.match(/_INPUT_/) ?
                str.replace('_INPUT_', input) :
                str + input;

            var filter = $('<div/>', {
                'id': !features.f ? tableId + '_filter' : null,
                'class': classes.sFilter
            })
                .append($('<label/>').append(str));

            var searchFn = function () {
                /* Update all other filter input elements for the new display */
                var n = features.f;
                var val = !this.value ? "" : this.value; // mental IE8 fix :-(

                /* Now do the filter */
                if (val != previousSearch.sSearch) {
                    _fnFilterComplete(settings, {
                        "sSearch": val,
                        "bRegex": previousSearch.bRegex,
                        "bSmart": previousSearch.bSmart,
                        "bCaseInsensitive": previousSearch.bCaseInsensitive
                    });

                    // Need to redraw, without resorting
                    settings._iDisplayStart = 0;
                    _fnDraw(settings);
                }
            };
            var jqFilter = $('input[type="search"]', filter)
                .val(previousSearch.sSearch.replace('"', '&quot;'))
                .bind(
                    'keyup.DT search.DT input.DT paste.DT cut.DT',
                    _fnDataSource(settings) === 'ssp' ?
                        _fnThrottle(searchFn, 400) :
                        searchFn
                )
                .bind('keypress.DT', function (e) {
                    /* Prevent form submission */
                    if (e.keyCode == 13) {
                        return false;
                    }
                })
                .attr('aria-controls', tableId);

            // Update the input elements whenever the table is filtered
            $(settings.nTable).on('filter.DT', function () {
                // IE9 throws an 'unknown error' if document.activeElement is used
                // inside an iframe or frame...
                try {
                    if (jqFilter[0] !== document.activeElement) {
                        jqFilter.val(previousSearch.sSearch);
                    }
                }
                catch (e) {
                }
            });

            return filter[0];
        }


        /**
         * Filter the table using both the global filter and column based filtering
         *  @param {object} oSettings dataTables settings object
         *  @param {object} oSearch search information
         *  @param {int} [iForce] force a research of the master array (1) or not (undefined or 0)
         *  @memberof DataTable#oApi
         */
        function _fnFilterComplete(oSettings, oInput, iForce) {
            var oPrevSearch = oSettings.oPreviousSearch;
            var aoPrevSearch = oSettings.aoPreSearchCols;
            var fnSaveFilter = function (oFilter) {
                /* Save the filtering values */
                oPrevSearch.sSearch = oFilter.sSearch;
                oPrevSearch.bRegex = oFilter.bRegex;
                oPrevSearch.bSmart = oFilter.bSmart;
                oPrevSearch.bCaseInsensitive = oFilter.bCaseInsensitive;
            };

            // Resolve any column types that are unknown due to addition or invalidation
            // @todo As per sort - can this be moved into an event handler?
            _fnColumnTypes(oSettings);

            /* In server-side processing all filtering is done by the server, so no point hanging around here */
            if (_fnDataSource(oSettings) != 'ssp') {
                /* Global filter */
                _fnFilter(oSettings, oInput.sSearch, iForce, oInput.bRegex, oInput.bSmart, oInput.bCaseInsensitive);
                fnSaveFilter(oInput);

                /* Now do the individual column filter */
                for (var i = 0; i < aoPrevSearch.length; i++) {
                    _fnFilterColumn(oSettings, aoPrevSearch[i].sSearch, i, aoPrevSearch[i].bRegex,
                        aoPrevSearch[i].bSmart, aoPrevSearch[i].bCaseInsensitive);
                }

                /* Custom filtering */
                _fnFilterCustom(oSettings);
            }
            else {
                fnSaveFilter(oInput);
            }

            /* Tell the draw function we have been filtering */
            oSettings.bFiltered = true;
            _fnCallbackFire(oSettings, null, 'search', [oSettings]);
        }


        /**
         * Apply custom filtering functions
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnFilterCustom(oSettings) {
            var afnFilters = DataTable.ext.search;
            var aiFilterColumns = _fnGetColumns(oSettings, 'bSearchable');

            for (var i = 0, iLen = afnFilters.length; i < iLen; i++) {
                var iCorrector = 0;
                for (var j = 0, jLen = oSettings.aiDisplay.length; j < jLen; j++) {
                    var iDisIndex = oSettings.aiDisplay[j - iCorrector];
                    var bTest = afnFilters[i](
                        oSettings,
                        _fnGetRowData(oSettings, iDisIndex, 'filter', aiFilterColumns),
                        iDisIndex
                    );

                    /* Check if we should use this row based on the filtering function */
                    if (!bTest) {
                        oSettings.aiDisplay.splice(j - iCorrector, 1);
                        iCorrector++;
                    }
                }
            }
        }


        /**
         * Filter the table on a per-column basis
         *  @param {object} oSettings dataTables settings object
         *  @param {string} sInput string to filter on
         *  @param {int} iColumn column to filter
         *  @param {bool} bRegex treat search string as a regular expression or not
         *  @param {bool} bSmart use smart filtering or not
         *  @param {bool} bCaseInsensitive Do case insenstive matching or not
         *  @memberof DataTable#oApi
         */
        function _fnFilterColumn(settings, searchStr, colIdx, regex, smart, caseInsensitive) {
            if (searchStr === '') {
                return;
            }

            var data;
            var display = settings.aiDisplay;
            var rpSearch = _fnFilterCreateSearch(searchStr, regex, smart, caseInsensitive);

            for (var i = display.length - 1; i >= 0; i--) {
                data = settings.aoData[display[i]]._aFilterData[colIdx];

                if (!rpSearch.test(data)) {
                    display.splice(i, 1);
                }
            }
        }


        /**
         * Filter the data table based on user input and draw the table
         *  @param {object} settings dataTables settings object
         *  @param {string} input string to filter on
         *  @param {int} force optional - force a research of the master array (1) or not (undefined or 0)
         *  @param {bool} regex treat as a regular expression or not
         *  @param {bool} smart perform smart filtering or not
         *  @param {bool} caseInsensitive Do case insenstive matching or not
         *  @memberof DataTable#oApi
         */
        function _fnFilter(settings, input, force, regex, smart, caseInsensitive) {
            var rpSearch = _fnFilterCreateSearch(input, regex, smart, caseInsensitive);
            var prevSearch = settings.oPreviousSearch.sSearch;
            var displayMaster = settings.aiDisplayMaster;
            var display, invalidated, i;

            // Need to take account of custom filtering functions - always filter
            if (DataTable.ext.search.length !== 0) {
                force = true;
            }

            // Check if any of the rows were invalidated
            invalidated = _fnFilterData(settings);

            // If the input is blank - we just want the full data set
            if (input.length <= 0) {
                settings.aiDisplay = displayMaster.slice();
            }
            else {
                // New search - start from the master array
                if (invalidated ||
                    force ||
                    prevSearch.length > input.length ||
                    input.indexOf(prevSearch) !== 0 ||
                    settings.bSorted // On resort, the display master needs to be
                                     // re-filtered since indexes will have changed
                ) {
                    settings.aiDisplay = displayMaster.slice();
                }

                // Search the display array
                display = settings.aiDisplay;

                for (i = display.length - 1; i >= 0; i--) {
                    if (!rpSearch.test(settings.aoData[display[i]]._sFilterRow)) {
                        display.splice(i, 1);
                    }
                }
            }
        }


        /**
         * Build a regular expression object suitable for searching a table
         *  @param {string} sSearch string to search for
         *  @param {bool} bRegex treat as a regular expression or not
         *  @param {bool} bSmart perform smart filtering or not
         *  @param {bool} bCaseInsensitive Do case insensitive matching or not
         *  @returns {RegExp} constructed object
         *  @memberof DataTable#oApi
         */
        function _fnFilterCreateSearch(sSearch, bRegex, bSmart, bCaseInsensitive) {
            var asSearch,
                sRegExpString = bRegex ? sSearch : _fnEscapeRegex(sSearch);

            if (bSmart) {
                /* Generate the regular expression to use. Something along the lines of:
			 * ^(?=.*?\bone\b)(?=.*?\btwo\b)(?=.*?\bthree\b).*$
			 */
                asSearch = sRegExpString.split(' ');
                sRegExpString = '^(?=.*?' + asSearch.join(')(?=.*?') + ').*$';
            }

            return new RegExp(sRegExpString, bCaseInsensitive ? "i" : "");
        }


        /**
         * scape a string such that it can be used in a regular expression
         *  @param {string} sVal string to escape
         *  @returns {string} escaped string
         *  @memberof DataTable#oApi
         */
        function _fnEscapeRegex(sVal) {
            return sVal.replace(_re_escape_regex, '\\$1');
        }


        var __filter_div = $('<div>')[0];
        var __filter_div_textContent = __filter_div.textContent !== undefined;

        // Update the filtering data for each row if needed (by invalidation or first run)
        function _fnFilterData(settings) {
            var columns = settings.aoColumns;
            var column;
            var i, j, ien, jen, filterData, cellData, row;
            var fomatters = DataTable.ext.type.search;
            var wasInvalidated = false;

            for (i = 0, ien = settings.aoData.length; i < ien; i++) {
                row = settings.aoData[i];

                if (!row._aFilterData) {
                    filterData = [];

                    for (j = 0, jen = columns.length; j < jen; j++) {
                        column = columns[j];

                        if (column.bSearchable) {
                            cellData = _fnGetCellData(settings, i, j, 'filter');

                            cellData = fomatters[column.sType] ?
                                fomatters[column.sType](cellData) :
                                cellData !== null ?
                                    cellData :
                                    '';
                        }
                        else {
                            cellData = '';
                        }

                        // If it looks like there is an HTML entity in the string,
                        // attempt to decode it so sorting works as expected. Note that
                        // we could use a single line of jQuery to do this, but the DOM
                        // method used here is much faster http://jsperf.com/html-decode
                        if (cellData.indexOf && cellData.indexOf('&') !== -1) {
                            __filter_div.innerHTML = cellData;
                            cellData = __filter_div_textContent ?
                                __filter_div.textContent :
                                __filter_div.innerText;
                            cellData = cellData.replace(/[\r\n]/g, '');
                        }

                        filterData.push(cellData);
                    }

                    row._aFilterData = filterData;
                    row._sFilterRow = filterData.join('  ');
                    wasInvalidated = true;
                }
            }

            return wasInvalidated;
        }

        /**
         * Generate the node required for the info display
         *  @param {object} oSettings dataTables settings object
         *  @returns {node} Information element
         *  @memberof DataTable#oApi
         */
        function _fnFeatureHtmlInfo(settings) {
            var
                tid = settings.sTableId,
                nodes = settings.aanFeatures.i,
                n = $('<div/>', {
                    'class': settings.oClasses.sInfo,
                    'id': !nodes ? tid + '_info' : null
                });

            if (!nodes) {
                // Update display on each draw
                settings.aoDrawCallback.push({
                    "fn": _fnUpdateInfo,
                    "sName": "information"
                });

                n
                    .attr('role', 'alert')
                    .attr('aria-live', 'polite')
                    .attr('aria-relevant', 'all');

                // Table is described by our info div
                $(settings.nTable).attr('aria-describedby', tid + '_info');
            }

            return n[0];
        }


        /**
         * Update the information elements in the display
         *  @param {object} settings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnUpdateInfo(settings) {
            /* Show information about the table */
            var nodes = settings.aanFeatures.i;
            if (nodes.length === 0) {
                return;
            }
            var
                lang = settings.oLanguage,
                start = settings._iDisplayStart + 1,
                end = settings.fnDisplayEnd(),
                max = settings.fnRecordsTotal(),
                total = settings.fnRecordsDisplay(),
                out = total ?
                    lang.sInfo :
                    lang.sInfoEmpty;

            if (total !== max) {
                /* Record set after filtering */
                out += ' ' + lang.sInfoFiltered;
            }

            // Convert the macros
            out += lang.sInfoPostFix;
            out = _fnInfoMacros(settings, out);

            var callback = lang.fnInfoCallback;
            if (callback !== null) {
                out = callback.call(settings.oInstance,
                    settings, start, end, max, total, out
                );
            }
            $(nodes).html(out);
        }


        function _fnInfoMacros(settings, str) {
            // When infinite scrolling, we are always starting at 1. _iDisplayStart is used only
            // internally
            var
                formatter = settings.fnFormatNumber,
                start = settings._iDisplayStart + 1,
                len = settings._iDisplayLength,
                vis = settings.fnRecordsDisplay(),
                all = len === -1;

            return str.replace(/_START_/g, formatter.call(settings, start)).replace(/_END_/g, formatter.call(settings, settings.fnDisplayEnd())).replace(/_MAX_/g, formatter.call(settings, settings.fnRecordsTotal())).replace(/_TOTAL_/g, formatter.call(settings, vis)).replace(/_PAGE_/g, formatter.call(settings, all ? 1 : Math.ceil(start / len))).replace(/_PAGES_/g, formatter.call(settings, all ? 1 : Math.ceil(vis / len)));
        }


        /**
         * Draw the table for the first time, adding all required features
         *  @param {object} settings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnInitialise(settings) {
            var i, iLen, iAjaxStart = settings.iInitDisplayStart;
            var columns = settings.aoColumns, column;
            var features = settings.oFeatures;

            /* Ensure that the table data is fully initialised */
            if (!settings.bInitialised) {
                setTimeout(function () {
                    _fnInitialise(settings);
                }, 200);
                return;
            }

            /* Show the display HTML options */
            _fnAddOptionsHtml(settings);

            /* Build and draw the header / footer for the table */
            _fnBuildHead(settings);
            _fnDrawHead(settings, settings.aoHeader);
            _fnDrawHead(settings, settings.aoFooter);

            /* Okay to show that something is going on now */
            _fnProcessingDisplay(settings, true);

            /* Calculate sizes for columns */
            if (features.bAutoWidth) {
                _fnCalculateColumnWidths(settings);
            }

            for (i = 0, iLen = columns.length; i < iLen; i++) {
                column = columns[i];

                if (column.sWidth) {
                    column.nTh.style.width = _fnStringToCss(column.sWidth);
                }
            }

            // If there is default sorting required - let's do it. The sort function
            // will do the drawing for us. Otherwise we draw the table regardless of the
            // Ajax source - this allows the table to look initialised for Ajax sourcing
            // data (show 'loading' message possibly)
            _fnReDraw(settings);

            // Server-side processing init complete is done by _fnAjaxUpdateDraw
            var dataSrc = _fnDataSource(settings);
            if (dataSrc != 'ssp') {
                // if there is an ajax source load the data
                if (dataSrc == 'ajax') {
                    _fnBuildAjax(settings, [], function (json) {
                        var aData = _fnAjaxDataSrc(settings, json);

                        // Got the data - add it to the table
                        for (i = 0; i < aData.length; i++) {
                            _fnAddData(settings, aData[i]);
                        }

                        // Reset the init display for cookie saving. We've already done
                        // a filter, and therefore cleared it before. So we need to make
                        // it appear 'fresh'
                        settings.iInitDisplayStart = iAjaxStart;

                        _fnReDraw(settings);

                        _fnProcessingDisplay(settings, false);
                        _fnInitComplete(settings, json);
                    }, settings);
                }
                else {
                    _fnProcessingDisplay(settings, false);
                    _fnInitComplete(settings);
                }
            }
        }


        /**
         * Draw the table for the first time, adding all required features
         *  @param {object} oSettings dataTables settings object
         *  @param {object} [json] JSON from the server that completed the table, if using Ajax source
         *    with client-side processing (optional)
         *  @memberof DataTable#oApi
         */
        function _fnInitComplete(settings, json) {
            settings._bInitComplete = true;

            // On an Ajax load we now have data and therefore want to apply the column
            // sizing
            if (json) {
                _fnAdjustColumnSizing(settings);
            }

            _fnCallbackFire(settings, 'aoInitComplete', 'init', [settings, json]);
        }


        function _fnLengthChange(settings, val) {
            var len = parseInt(val, 10);
            settings._iDisplayLength = len;
            _fnLengthOverflow(settings);

            // Fire length change event
            _fnCallbackFire(settings, null, 'length', [settings, len]);
        }


        /**
         * Generate the node required for user display length changing
         *  @param {object} settings dataTables settings object
         *  @returns {node} Display length feature node
         *  @memberof DataTable#oApi
         */
        function _fnFeatureHtmlLength(settings) {
            var
                classes = settings.oClasses,
                tableId = settings.sTableId,
                menu = settings.aLengthMenu,
                d2 = $.isArray(menu[0]),
                lengths = d2 ? menu[0] : menu,
                language = d2 ? menu[1] : menu;

            var select = $('<select/>', {
                'name': tableId + '_length',
                'aria-controls': tableId,
                'class': classes.sLengthSelect
            });

            for (var i = 0, ien = lengths.length; i < ien; i++) {
                select[0][i] = new Option(language[i], lengths[i]);
            }

            var div = $('<div><label/></div>').addClass(classes.sLength);
            if (!settings.aanFeatures.l) {
                div[0].id = tableId + '_length';
            }

            // This split doesn't matter where _MENU_ is, we get three items back from it
            var a = settings.oLanguage.sLengthMenu.split(/(_MENU_)/);
            div.children()
                .append(a[0])
                .append(select)
                .append(a[2]);

            select
                .val(settings._iDisplayLength)
                .bind('change.DT', function (e) {
                    layer.load(2);
                    _fnLengthChange(settings, $(this).val());
                    settings._iDisplayStart = 0;
                    _fnDraw(settings);
                });

            // Update node value whenever anything changes the table's length
            $(settings.nTable).bind('length', function (e, s, len) {
                select.val(len);
            });

            return div[0];
        }


        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Note that most of the paging logic is done in
	 * DataTable.ext.pager
	 */

        /**
         * Generate the node required for default pagination
         *  @param {object} oSettings dataTables settings object
         *  @returns {node} Pagination feature node
         *  @memberof DataTable#oApi
         */
        function _fnFeatureHtmlPaginate(settings) {
            var
                type = settings.sPaginationType,
                plugin = DataTable.ext.pager[type],
                modern = typeof plugin === 'function',
                redraw = function (settings) {
                    _fnDraw(settings);
                },
                node = $('<div/>').addClass(settings.oClasses.sPaging + type)[0],
                features = settings.aanFeatures;

            if (!modern) {
                plugin.fnInit(settings, node, redraw);
            }

            /* Add a draw callback for the pagination on first instance, to update the paging display */
            if (!features.p) {
                node.id = settings.sTableId + '_paginate';

                settings.aoDrawCallback.push({
                    "fn": function (settings) {
                        if (modern) {
                            var
                                start = settings._iDisplayStart,
                                len = settings._iDisplayLength,
                                visRecords = settings.fnRecordsDisplay(),
                                all = len === -1,
                                page = all ? 0 : Math.ceil(start / len),
                                pages = all ? 1 : Math.ceil(visRecords / len),
                                buttons = plugin(page, pages),
                                i, ien;

                            for (i = 0, ien = features.p.length; i < ien; i++) {
                                _fnRenderer(settings, 'pageButton')(
                                    settings, features.p[i], i, buttons, page, pages
                                );
                            }
                        }
                        else {
                            plugin.fnUpdate(settings, redraw);
                        }
                    },
                    "sName": "pagination"
                });
            }

            return node;
        }


        /**
         * Alter the display settings to change the page
         *  @param {object} settings DataTables settings object
         *  @param {string|int} action Paging action to take: "first", "previous",
         *    "next" or "last" or page number to jump to (integer)
         *  @param [bool] redraw Automatically draw the update or not
         *  @returns {bool} true page has changed, false - no change
         *  @memberof DataTable#oApi
         */
        function _fnPageChange(settings, action, redraw) {
            var
                start = settings._iDisplayStart,
                len = settings._iDisplayLength,
                records = settings.fnRecordsDisplay();

            if (records === 0 || len === -1) {
                start = 0;
            }
            else if (typeof action === "number") {
                start = action * len;

                if (start > records) {
                    start = 0;
                }
            }
            else if (action == "first") {
                start = 0;
            }
            else if (action == "previous") {
                start = len >= 0 ?
                    start - len :
                    0;

                if (start < 0) {
                    start = 0;
                }
            }
            else if (action == "next") {
                if (start + len < records) {
                    start += len;
                }
            }
            else if (action == "last") {
                start = Math.floor((records - 1) / len) * len;
            }
            else {
                _fnLog(settings, 0, "Unknown paging action: " + action, 5);
            }

            var changed = settings._iDisplayStart !== start;
            settings._iDisplayStart = start;

            _fnCallbackFire(settings, null, 'page', [settings]);

            if (redraw) {
                _fnDraw(settings);
            }

            return changed;
        }


        /**
         * Generate the node required for the processing node
         *  @param {object} settings dataTables settings object
         *  @returns {node} Processing element
         *  @memberof DataTable#oApi
         */
        function _fnFeatureHtmlProcessing(settings) {
            return $('<div/>', {
                'id': !settings.aanFeatures.r ? settings.sTableId + '_processing' : null,
                'class': settings.oClasses.sProcessing
            })
                .html(settings.oLanguage.sProcessing)
                .insertBefore(settings.nTable)[0];
        }


        /**
         * Display or hide the processing indicator
         *  @param {object} settings dataTables settings object
         *  @param {bool} show Show the processing indicator (true) or not (false)
         *  @memberof DataTable#oApi
         */
        function _fnProcessingDisplay(settings, show) {
            if (settings.oFeatures.bProcessing) {
                $(settings.aanFeatures.r).css('visibility', show ? 'visible' : 'hidden');
            }

            _fnCallbackFire(settings, null, 'processing', [settings, show]);
        }

        /**
         * Add any control elements for the table - specifically scrolling
         *  @param {object} settings dataTables settings object
         *  @returns {node} Node to add to the DOM
         *  @memberof DataTable#oApi
         */
        function _fnFeatureHtmlTable(settings) {
            var scroll = settings.oScroll;

            if (scroll.sX === '' && scroll.sY === '') {
                return settings.nTable;
            }

            var scrollX = scroll.sX;
            var scrollY = scroll.sY;
            var classes = settings.oClasses;
            var table = $(settings.nTable);
            var caption = table.children('caption');
            var captionSide = caption.length ? caption[0]._captionSide : null;
            var headerClone = $(table[0].cloneNode(false));
            var footerClone = $(table[0].cloneNode(false));
            var footer = table.children('tfoot');
            var _div = '<div/>';
            var size = function (s) {
                return !s ? null : _fnStringToCss(s);
            };

            // This is fairly messy, but with x scrolling enabled, if the table has a
            // width attribute, regardless of any width applied using the column width
            // options, the browser will shrink or grow the table as needed to fit into
            // that 100%. That would make the width options useless. So we remove it.
            // This is okay, under the assumption that width:100% is applied to the
            // table in CSS (it is in the default stylesheet) which will set the table
            // width as appropriate (the attribute and css behave differently...)
            if (scroll.sX && table.attr('width') === '100%') {
                table.removeAttr('width');
            }

            if (!footer.length) {
                footer = null;
            }

            /*
		 * The HTML structure that we want to generate in this function is:
		 *  div - scroller
		 *    div - scroll head
		 *      div - scroll head inner
		 *        table - scroll head table
		 *          thead - thead
		 *    div - scroll body
		 *      table - table (master table)
		 *        thead - thead clone for sizing
		 *        tbody - tbody
		 *    div - scroll foot
		 *      div - scroll foot inner
		 *        table - scroll foot table
		 *          tfoot - tfoot
		 */
            var scroller = $(_div, {'class': classes.sScrollWrapper})
                .append(
                    $(_div, {'class': classes.sScrollHead})
                        .css({
                            overflow: 'hidden',
                            position: 'relative',
                            border: 0,
                            width: scrollX ? size(scrollX) : '100%'
                        })
                        .append(
                            $(_div, {'class': classes.sScrollHeadInner})
                                .css({
                                    'box-sizing': 'content-box',
                                    width: scroll.sXInner || '100%'
                                })
                                .append(
                                    headerClone
                                        .removeAttr('id')
                                        .css('margin-left', 0)
                                        .append(
                                            table.children('thead')
                                        )
                                )
                        )
                        .append(captionSide === 'top' ? caption : null)
                )
                .append(
                    $(_div, {'class': classes.sScrollBody})
                        .css({
                            overflow: 'auto',
                            height: size(scrollY),
                            width: size(scrollX)
                        })
                        .append(table)
                );

            if (footer) {
                scroller.append(
                    $(_div, {'class': classes.sScrollFoot})
                        .css({
                            overflow: 'hidden',
                            border: 0,
                            width: scrollX ? size(scrollX) : '100%'
                        })
                        .append(
                            $(_div, {'class': classes.sScrollFootInner})
                                .append(
                                    footerClone
                                        .removeAttr('id')
                                        .css('margin-left', 0)
                                        .append(
                                            table.children('tfoot')
                                        )
                                )
                        )
                        .append(captionSide === 'bottom' ? caption : null)
                );
            }

            var children = scroller.children();
            var scrollHead = children[0];
            var scrollBody = children[1];
            var scrollFoot = footer ? children[2] : null;

            // When the body is scrolled, then we also want to scroll the headers
            if (scrollX) {
                $(scrollBody).scroll(function (e) {
                    var scrollLeft = this.scrollLeft;

                    scrollHead.scrollLeft = scrollLeft;

                    if (footer) {
                        scrollFoot.scrollLeft = scrollLeft;
                    }
                });
            }

            settings.nScrollHead = scrollHead;
            settings.nScrollBody = scrollBody;
            settings.nScrollFoot = scrollFoot;

            // On redraw - align columns
            settings.aoDrawCallback.push({
                "fn": _fnScrollDraw,
                "sName": "scrolling"
            });

            return scroller[0];
        }


        /**
         * Update the header, footer and body tables for resizing - i.e. column
         * alignment.
         *
         * Welcome to the most horrible function DataTables. The process that this
         * function follows is basically:
         *   1. Re-create the table inside the scrolling div
         *   2. Take live measurements from the DOM
         *   3. Apply the measurements to align the columns
         *   4. Clean up
         *
         *  @param {object} settings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnScrollDraw(settings) {
            // Given that this is such a monster function, a lot of variables are use
            // to try and keep the minimised size as small as possible
            var
                scroll = settings.oScroll,
                scrollX = scroll.sX,
                scrollXInner = scroll.sXInner,
                scrollY = scroll.sY,
                barWidth = scroll.iBarWidth,
                divHeader = $(settings.nScrollHead),
                divHeaderStyle = divHeader[0].style,
                divHeaderInner = divHeader.children('div'),
                divHeaderInnerStyle = divHeaderInner[0].style,
                divHeaderTable = divHeaderInner.children('table'),
                divBodyEl = settings.nScrollBody,
                divBody = $(divBodyEl),
                divBodyStyle = divBodyEl.style,
                divFooter = $(settings.nScrollFoot),
                divFooterInner = divFooter.children('div'),
                divFooterTable = divFooterInner.children('table'),
                header = $(settings.nTHead),
                table = $(settings.nTable),
                tableEl = table[0],
                tableStyle = tableEl.style,
                footer = settings.nTFoot ? $(settings.nTFoot) : null,
                browser = settings.oBrowser,
                ie67 = browser.bScrollOversize,
                headerTrgEls, footerTrgEls,
                headerSrcEls, footerSrcEls,
                headerCopy, footerCopy,
                headerWidths = [], footerWidths = [],
                headerContent = [],
                idx, correction, sanityWidth,
                zeroOut = function (nSizer) {
                    var style = nSizer.style;
                    style.paddingTop = "0";
                    style.paddingBottom = "0";
                    style.borderTopWidth = "0";
                    style.borderBottomWidth = "0";
                    style.height = 0;
                };

            /*
		 * 1. Re-create the table inside the scrolling div
		 */

            // Remove the old minimised thead and tfoot elements in the inner table
            table.children('thead, tfoot').remove();

            // Clone the current header and footer elements and then place it into the inner table
            headerCopy = header.clone().prependTo(table);
            headerTrgEls = header.find('tr'); // original header is in its own table
            headerSrcEls = headerCopy.find('tr');
            headerCopy.find('th, td').removeAttr('tabindex');

            if (footer) {
                footerCopy = footer.clone().prependTo(table);
                footerTrgEls = footer.find('tr'); // the original tfoot is in its own table and must be sized
                footerSrcEls = footerCopy.find('tr');
            }


            /*
		 * 2. Take live measurements from the DOM - do not alter the DOM itself!
		 */

            // Remove old sizing and apply the calculated column widths
            // Get the unique column headers in the newly created (cloned) header. We want to apply the
            // calculated sizes to this header
            if (!scrollX) {
                divBodyStyle.width = '100%';
                divHeader[0].style.width = '100%';
            }

            $.each(_fnGetUniqueThs(settings, headerCopy), function (i, el) {
                idx = _fnVisibleToColumnIndex(settings, i);
                el.style.width = settings.aoColumns[idx].sWidth;
            });

            if (footer) {
                _fnApplyToChildren(function (n) {
                    n.style.width = "";
                }, footerSrcEls);
            }

            // If scroll collapse is enabled, when we put the headers back into the body for sizing, we
            // will end up forcing the scrollbar to appear, making our measurements wrong for when we
            // then hide it (end of this function), so add the header height to the body scroller.
            if (scroll.bCollapse && scrollY !== "") {
                divBodyStyle.height = (divBody.offsetHeight + header[0].offsetHeight) + "px";
            }

            // Size the table as a whole
            sanityWidth = table.outerWidth();
            if (scrollX === "") {
                // No x scrolling
                tableStyle.width = "100%";

                // IE7 will make the width of the table when 100% include the scrollbar
                // - which is shouldn't. When there is a scrollbar we need to take this
                // into account.
                if (ie67 && (table.find('tbody').height() > divBodyEl.offsetHeight ||
                        divBody.css('overflow-y') == "scroll")
                ) {
                    tableStyle.width = _fnStringToCss(table.outerWidth() - barWidth);
                }
            }
            else {
                // x scrolling
                if (scrollXInner !== "") {
                    // x scroll inner has been given - use it
                    tableStyle.width = _fnStringToCss(scrollXInner);
                }
                else if (sanityWidth == divBody.width() && divBody.height() < table.height()) {
                    // There is y-scrolling - try to take account of the y scroll bar
                    tableStyle.width = _fnStringToCss(sanityWidth - barWidth);
                    if (table.outerWidth() > sanityWidth - barWidth) {
                        // Not possible to take account of it
                        tableStyle.width = _fnStringToCss(sanityWidth);
                    }
                }
                else {
                    // When all else fails
                    tableStyle.width = _fnStringToCss(sanityWidth);
                }
            }

            // Recalculate the sanity width - now that we've applied the required width,
            // before it was a temporary variable. This is required because the column
            // width calculation is done before this table DOM is created.
            sanityWidth = table.outerWidth();

            // Hidden header should have zero height, so remove padding and borders. Then
            // set the width based on the real headers

            // Apply all styles in one pass
            _fnApplyToChildren(zeroOut, headerSrcEls);

            // Read all widths in next pass
            _fnApplyToChildren(function (nSizer) {
                headerContent.push(nSizer.innerHTML);
                headerWidths.push(_fnStringToCss($(nSizer).css('width')));
            }, headerSrcEls);

            // Apply all widths in final pass
            _fnApplyToChildren(function (nToSize, i) {
                nToSize.style.width = headerWidths[i];
            }, headerTrgEls);

            $(headerSrcEls).height(0);

            /* Same again with the footer if we have one */
            if (footer) {
                _fnApplyToChildren(zeroOut, footerSrcEls);

                _fnApplyToChildren(function (nSizer) {
                    footerWidths.push(_fnStringToCss($(nSizer).css('width')));
                }, footerSrcEls);

                _fnApplyToChildren(function (nToSize, i) {
                    nToSize.style.width = footerWidths[i];
                }, footerTrgEls);

                $(footerSrcEls).height(0);
            }


            /*
		 * 3. Apply the measurements
		 */

            // "Hide" the header and footer that we used for the sizing. We need to keep
            // the content of the cell so that the width applied to the header and body
            // both match, but we want to hide it completely. We want to also fix their
            // width to what they currently are
            _fnApplyToChildren(function (nSizer, i) {
                nSizer.innerHTML = '<div class="dataTables_sizing" style="height:0;overflow:hidden;">' + headerContent[i] + '</div>';
                nSizer.style.width = headerWidths[i];
            }, headerSrcEls);

            if (footer) {
                _fnApplyToChildren(function (nSizer, i) {
                    nSizer.innerHTML = "";
                    nSizer.style.width = footerWidths[i];
                }, footerSrcEls);
            }

            // Sanity check that the table is of a sensible width. If not then we are going to get
            // misalignment - try to prevent this by not allowing the table to shrink below its min width
            if (table.outerWidth() < sanityWidth) {
                // The min width depends upon if we have a vertical scrollbar visible or not */
                correction = ((divBodyEl.scrollHeight > divBodyEl.offsetHeight ||
                    divBody.css('overflow-y') == "scroll")) ?
                    sanityWidth + barWidth :
                    sanityWidth;

                // IE6/7 are a law unto themselves...
                if (ie67 && (divBodyEl.scrollHeight >
                        divBodyEl.offsetHeight || divBody.css('overflow-y') == "scroll")
                ) {
                    tableStyle.width = _fnStringToCss(correction - barWidth);
                }

                // And give the user a warning that we've stopped the table getting too small
                if (scrollX === "" || scrollXInner !== "") {
                    _fnLog(settings, 1, 'Possible column misalignment', 6);
                }
            }
            else {
                correction = '100%';
            }

            // Apply to the container elements
            divBodyStyle.width = _fnStringToCss(correction);
            divHeaderStyle.width = _fnStringToCss(correction);

            if (footer) {
                settings.nScrollFoot.style.width = _fnStringToCss(correction);
            }


            /*
		 * 4. Clean up
		 */
            if (!scrollY) {
                /* IE7< puts a vertical scrollbar in place (when it shouldn't be) due to subtracting
			 * the scrollbar height from the visible display, rather than adding it on. We need to
			 * set the height in order to sort this. Don't want to do it in any other browsers.
			 */
                if (ie67) {
                    divBodyStyle.height = _fnStringToCss(tableEl.offsetHeight + barWidth);
                }
            }

            if (scrollY && scroll.bCollapse) {
                divBodyStyle.height = _fnStringToCss(scrollY);

                var iExtra = (scrollX && tableEl.offsetWidth > divBodyEl.offsetWidth) ?
                    barWidth :
                    0;

                if (tableEl.offsetHeight < divBodyEl.offsetHeight) {
                    divBodyStyle.height = _fnStringToCss(tableEl.offsetHeight + iExtra);
                }
            }

            /* Finally set the width's of the header and footer tables */
            var iOuterWidth = table.outerWidth();
            divHeaderTable[0].style.width = _fnStringToCss(iOuterWidth);
            divHeaderInnerStyle.width = _fnStringToCss(iOuterWidth);

            // Figure out if there are scrollbar present - if so then we need a the header and footer to
            // provide a bit more space to allow "overflow" scrolling (i.e. past the scrollbar)
            var bScrolling = table.height() > divBodyEl.clientHeight || divBody.css('overflow-y') == "scroll";
            var padding = 'padding' + (browser.bScrollbarLeft ? 'Left' : 'Right' );
            divHeaderInnerStyle[padding] = bScrolling ? barWidth + "px" : "0px";

            if (footer) {
                divFooterTable[0].style.width = _fnStringToCss(iOuterWidth);
                divFooterInner[0].style.width = _fnStringToCss(iOuterWidth);
                divFooterInner[0].style[padding] = bScrolling ? barWidth + "px" : "0px";
            }

            /* Adjust the position of the header in case we loose the y-scrollbar */
            divBody.scroll();

            /* If sorting or filtering has occurred, jump the scrolling back to the top */
            if (settings.bSorted || settings.bFiltered) {
                divBodyEl.scrollTop = 0;
            }
        }


        /**
         * Apply a given function to the display child nodes of an element array (typically
         * TD children of TR rows
         *  @param {function} fn Method to apply to the objects
         *  @param array {nodes} an1 List of elements to look through for display children
         *  @param array {nodes} an2 Another list (identical structure to the first) - optional
         *  @memberof DataTable#oApi
         */
        function _fnApplyToChildren(fn, an1, an2) {
            var index = 0, i = 0, iLen = an1.length;
            var nNode1, nNode2;

            while (i < iLen) {
                nNode1 = an1[i].firstChild;
                nNode2 = an2 ? an2[i].firstChild : null;

                while (nNode1) {
                    if (nNode1.nodeType === 1) {
                        if (an2) {
                            fn(nNode1, nNode2, index);
                        }
                        else {
                            fn(nNode1, index);
                        }

                        index++;
                    }

                    nNode1 = nNode1.nextSibling;
                    nNode2 = an2 ? nNode2.nextSibling : null;
                }

                i++;
            }
        }


        var __re_html_remove = /<.*?>/g;


        /**
         * Calculate the width of columns for the table
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnCalculateColumnWidths(oSettings) {
            var
                table = oSettings.nTable,
                columns = oSettings.aoColumns,
                scroll = oSettings.oScroll,
                scrollY = scroll.sY,
                scrollX = scroll.sX,
                scrollXInner = scroll.sXInner,
                columnCount = columns.length,
                visibleColumns = _fnGetColumns(oSettings, 'bVisible'),
                headerCells = $('th', oSettings.nTHead),
                tableWidthAttr = table.getAttribute('width'),
                tableContainer = table.parentNode,
                userInputs = false,
                i, column, columnIdx, width, outerWidth;

            /* Convert any user input sizes into pixel sizes */
            for (i = 0; i < visibleColumns.length; i++) {
                column = columns[visibleColumns[i]];

                if (column.sWidth !== null) {
                    column.sWidth = _fnConvertToWidth(column.sWidthOrig, tableContainer);

                    userInputs = true;
                }
            }

            /* If the number of columns in the DOM equals the number that we have to
		 * process in DataTables, then we can use the offsets that are created by
		 * the web- browser. No custom sizes can be set in order for this to happen,
		 * nor scrolling used
		 */
            if (!userInputs && !scrollX && !scrollY &&
                columnCount == _fnVisbleColumns(oSettings) &&
                columnCount == headerCells.length
            ) {
                for (i = 0; i < columnCount; i++) {
                    columns[i].sWidth = _fnStringToCss(headerCells.eq(i).width());
                }
            }
            else {
                // Otherwise construct a single row table with the widest node in the
                // data, assign any user defined widths, then insert it into the DOM and
                // allow the browser to do all the hard work of calculating table widths
                var tmpTable = $(table.cloneNode(false))
                    .css('visibility', 'hidden')
                    .removeAttr('id')
                    .append($(oSettings.nTHead).clone(false))
                    .append($(oSettings.nTFoot).clone(false))
                    .append($('<tbody><tr/></tbody>'));

                // Remove any assigned widths from the footer (from scrolling)
                tmpTable.find('tfoot th, tfoot td').css('width', '');

                var tr = tmpTable.find('tbody tr');

                // Apply custom sizing to the cloned header
                headerCells = _fnGetUniqueThs(oSettings, tmpTable.find('thead')[0]);

                for (i = 0; i < visibleColumns.length; i++) {
                    column = columns[visibleColumns[i]];

                    headerCells[i].style.width = column.sWidthOrig !== null && column.sWidthOrig !== '' ?
                        _fnStringToCss(column.sWidthOrig) :
                        '';
                }

                // Find the widest cell for each column and put it into the table
                if (oSettings.aoData.length) {
                    for (i = 0; i < visibleColumns.length; i++) {
                        columnIdx = visibleColumns[i];
                        column = columns[columnIdx];

                        $(_fnGetWidestNode(oSettings, columnIdx))
                            .clone(false)
                            .append(column.sContentPadding)
                            .appendTo(tr);
                    }
                }

                // Table has been built, attach to the document so we can work with it
                tmpTable.appendTo(tableContainer);

                // When scrolling (X or Y) we want to set the width of the table as
                // appropriate. However, when not scrolling leave the table width as it
                // is. This results in slightly different, but I think correct behaviour
                if (scrollX && scrollXInner) {
                    tmpTable.width(scrollXInner);
                }
                else if (scrollX) {
                    tmpTable.css('width', 'auto');

                    if (tmpTable.width() < tableContainer.offsetWidth) {
                        tmpTable.width(tableContainer.offsetWidth);
                    }
                }
                else if (scrollY) {
                    tmpTable.width(tableContainer.offsetWidth);
                }
                else if (tableWidthAttr) {
                    tmpTable.width(tableWidthAttr);
                }

                // Take into account the y scrollbar
                _fnScrollingWidthAdjust(oSettings, tmpTable[0]);

                // Browsers need a bit of a hand when a width is assigned to any columns
                // when x-scrolling as they tend to collapse the table to the min-width,
                // even if we sent the column widths. So we need to keep track of what
                // the table width should be by summing the user given values, and the
                // automatic values
                if (scrollX) {
                    var total = 0;

                    for (i = 0; i < visibleColumns.length; i++) {
                        column = columns[visibleColumns[i]];
                        outerWidth = $(headerCells[i]).outerWidth();

                        total += column.sWidthOrig === null ?
                            outerWidth :
                            parseInt(column.sWidth, 10) + outerWidth - $(headerCells[i]).width();
                    }

                    tmpTable.width(_fnStringToCss(total));
                    table.style.width = _fnStringToCss(total);
                }

                // Get the width of each column in the constructed table
                for (i = 0; i < visibleColumns.length; i++) {
                    column = columns[visibleColumns[i]];
                    width = $(headerCells[i]).width();

                    if (width) {
                        column.sWidth = _fnStringToCss(width);
                    }
                }

                table.style.width = _fnStringToCss(tmpTable.css('width'));

                // Finished with the table - ditch it
                tmpTable.remove();
            }

            // If there is a width attr, we want to attach an event listener which
            // allows the table sizing to automatically adjust when the window is
            // resized. Use the width attr rather than CSS, since we can't know if the
            // CSS is a relative value or absolute - DOM read is always px.
            if (tableWidthAttr) {
                table.style.width = _fnStringToCss(tableWidthAttr);
            }

            if ((tableWidthAttr || scrollX) && !oSettings._reszEvt) {
                $(window).bind('resize.DT-' + oSettings.sInstance, _fnThrottle(function () {
                    _fnAdjustColumnSizing(oSettings);
                }));

                oSettings._reszEvt = true;
            }
        }


        /**
         * Throttle the calls to a function. Arguments and context are maintained for
         * the throttled function
         *  @param {function} fn Function to be called
         *  @param {int} [freq=200] call frequency in mS
         *  @returns {function} wrapped function
         *  @memberof DataTable#oApi
         */
        function _fnThrottle(fn, freq) {
            var
                frequency = freq || 200,
                last,
                timer;

            return function () {
                var
                    that = this,
                    now = +new Date(),
                    args = arguments;

                if (last && now < last + frequency) {
                    clearTimeout(timer);

                    timer = setTimeout(function () {
                        last = undefined;
                        fn.apply(that, args);
                    }, frequency);
                }
                else if (last) {
                    last = now;
                    fn.apply(that, args);
                }
                else {
                    last = now;
                }
            };
        }


        /**
         * Convert a CSS unit width to pixels (e.g. 2em)
         *  @param {string} width width to be converted
         *  @param {node} parent parent to get the with for (required for relative widths) - optional
         *  @returns {int} width in pixels
         *  @memberof DataTable#oApi
         */
        function _fnConvertToWidth(width, parent) {
            if (!width) {
                return 0;
            }

            var n = $('<div/>')
                .css('width', _fnStringToCss(width))
                .appendTo(parent || document.body);

            var val = n[0].offsetWidth;
            n.remove();

            return val;
        }


        /**
         * Adjust a table's width to take account of vertical scroll bar
         *  @param {object} oSettings dataTables settings object
         *  @param {node} n table node
         *  @memberof DataTable#oApi
         */

        function _fnScrollingWidthAdjust(settings, n) {
            var scroll = settings.oScroll;

            if (scroll.sX || scroll.sY) {
                // When y-scrolling only, we want to remove the width of the scroll bar
                // so the table + scroll bar will fit into the area available, otherwise
                // we fix the table at its current size with no adjustment
                var correction = !scroll.sX ? scroll.iBarWidth : 0;
                n.style.width = _fnStringToCss($(n).outerWidth() - correction);
            }
        }


        /**
         * Get the widest node
         *  @param {object} settings dataTables settings object
         *  @param {int} colIdx column of interest
         *  @returns {node} widest table node
         *  @memberof DataTable#oApi
         */
        function _fnGetWidestNode(settings, colIdx) {
            var idx = _fnGetMaxLenString(settings, colIdx);
            if (idx < 0) {
                return null;
            }

            var data = settings.aoData[idx];
            return !data.nTr ? // Might not have been created when deferred rendering
                $('<td/>').html(_fnGetCellData(settings, idx, colIdx, 'display'))[0] :
                data.anCells[colIdx];
        }


        /**
         * Get the maximum strlen for each data column
         *  @param {object} settings dataTables settings object
         *  @param {int} colIdx column of interest
         *  @returns {string} max string length for each column
         *  @memberof DataTable#oApi
         */
        function _fnGetMaxLenString(settings, colIdx) {
            var s, max = -1, maxIdx = -1;

            for (var i = 0, ien = settings.aoData.length; i < ien; i++) {
                s = _fnGetCellData(settings, i, colIdx, 'display') + '';
                s = s.replace(__re_html_remove, '');

                if (s.length > max) {
                    max = s.length;
                    maxIdx = i;
                }
            }

            return maxIdx;
        }


        /**
         * Append a CSS unit (only if required) to a string
         *  @param {string} value to css-ify
         *  @returns {string} value with css unit
         *  @memberof DataTable#oApi
         */
        function _fnStringToCss(s) {
            if (s === null) {
                return '0px';
            }

            if (typeof s == 'number') {
                return s < 0 ?
                    '0px' :
                    s + 'px';
            }

            // Check it has a unit character already
            return s.match(/\d$/) ?
                s + 'px' :
                s;
        }


        /**
         * Get the width of a scroll bar in this browser being used
         *  @returns {int} width in pixels
         *  @memberof DataTable#oApi
         */
        function _fnScrollBarWidth() {
            // On first run a static variable is set, since this is only needed once.
            // Subsequent runs will just use the previously calculated value
            if (!DataTable.__scrollbarWidth) {
                var inner = $('<p/>').css({
                    width: '100%',
                    height: 200,
                    padding: 0
                })[0];

                var outer = $('<div/>')
                    .css({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 200,
                        height: 150,
                        padding: 0,
                        overflow: 'hidden',
                        visibility: 'hidden'
                    })
                    .append(inner)
                    .appendTo('body');

                var w1 = inner.offsetWidth;
                outer.css('overflow', 'scroll');
                var w2 = inner.offsetWidth;

                if (w1 === w2) {
                    w2 = outer[0].clientWidth;
                }

                outer.remove();

                DataTable.__scrollbarWidth = w1 - w2;
            }

            return DataTable.__scrollbarWidth;
        }


        function _fnSortFlatten(settings) {
            var
                i, iLen, k, kLen,
                aSort = [],
                aiOrig = [],
                aoColumns = settings.aoColumns,
                aDataSort, iCol, sType, srcCol,
                fixed = settings.aaSortingFixed,
                fixedObj = $.isPlainObject(fixed),
                nestedSort = [],
                add = function (a) {
                    if (a.length && !$.isArray(a[0])) {
                        // 1D array
                        nestedSort.push(a);
                    }
                    else {
                        // 2D array
                        nestedSort.push.apply(nestedSort, a);
                    }
                };

            // Build the sort array, with pre-fix and post-fix options if they have been
            // specified
            if ($.isArray(fixed)) {
                add(fixed);
            }

            if (fixedObj && fixed.pre) {
                add(fixed.pre);
            }

            add(settings.aaSorting);

            if (fixedObj && fixed.post) {
                add(fixed.post);
            }

            for (i = 0; i < nestedSort.length; i++) {
                srcCol = nestedSort[i][0];
                aDataSort = aoColumns[srcCol].aDataSort;

                for (k = 0, kLen = aDataSort.length; k < kLen; k++) {
                    iCol = aDataSort[k];
                    sType = aoColumns[iCol].sType || 'string';

                    aSort.push({
                        src: srcCol,
                        col: iCol,
                        dir: nestedSort[i][1],
                        index: nestedSort[i][2],
                        type: sType,
                        formatter: DataTable.ext.type.order[sType + "-pre"]
                    });
                }
            }

            return aSort;
        }

        /**
         * Change the order of the table
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         *  @todo This really needs split up!
         */
        function _fnSort(oSettings) {
            var
                i, ien, iLen, j, jLen, k, kLen,
                sDataType, nTh,
                aiOrig = [],
                oExtSort = DataTable.ext.type.order,
                aoData = oSettings.aoData,
                aoColumns = oSettings.aoColumns,
                aDataSort, data, iCol, sType, oSort,
                formatters = 0,
                sortCol,
                displayMaster = oSettings.aiDisplayMaster,
                aSort = _fnSortFlatten(oSettings);

            // Resolve any column types that are unknown due to addition or invalidation
            // @todo Can this be moved into a 'data-ready' handler which is called when
            //   data is going to be used in the table?
            _fnColumnTypes(oSettings);

            for (i = 0, ien = aSort.length; i < ien; i++) {
                sortCol = aSort[i];

                // Track if we can use the fast sort algorithm
                if (sortCol.formatter) {
                    formatters++;
                }

                // Load the data needed for the sort, for each cell
                _fnSortData(oSettings, sortCol.col);
            }

            /* No sorting required if server-side or no sorting array */
            if (_fnDataSource(oSettings) != 'ssp' && aSort.length !== 0) {
                // Create a value - key array of the current row positions such that we can use their
                // current position during the sort, if values match, in order to perform stable sorting
                for (i = 0, iLen = displayMaster.length; i < iLen; i++) {
                    aiOrig[displayMaster[i]] = i;
                }

                /* Do the sort - here we want multi-column sorting based on a given data source (column)
			 * and sorting function (from oSort) in a certain direction. It's reasonably complex to
			 * follow on it's own, but this is what we want (example two column sorting):
			 *  fnLocalSorting = function(a,b){
			 *    var iTest;
			 *    iTest = oSort['string-asc']('data11', 'data12');
			 *      if (iTest !== 0)
			 *        return iTest;
			 *    iTest = oSort['numeric-desc']('data21', 'data22');
			 *    if (iTest !== 0)
			 *      return iTest;
			 *    return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
			 *  }
			 * Basically we have a test for each sorting column, if the data in that column is equal,
			 * test the next column. If all columns match, then we use a numeric sort on the row
			 * positions in the original data array to provide a stable sort.
			 *
			 * Note - I know it seems excessive to have two sorting methods, but the first is around
			 * 15% faster, so the second is only maintained for backwards compatibility with sorting
			 * methods which do not have a pre-sort formatting function.
			 */
                if (formatters === aSort.length) {
                    // All sort types have formatting functions
                    displayMaster.sort(function (a, b) {
                        var
                            x, y, k, test, sort,
                            len = aSort.length,
                            dataA = aoData[a]._aSortData,
                            dataB = aoData[b]._aSortData;

                        for (k = 0; k < len; k++) {
                            sort = aSort[k];

                            x = dataA[sort.col];
                            y = dataB[sort.col];

                            test = x < y ? -1 : x > y ? 1 : 0;
                            if (test !== 0) {
                                return sort.dir === 'asc' ? test : -test;
                            }
                        }

                        x = aiOrig[a];
                        y = aiOrig[b];
                        return x < y ? -1 : x > y ? 1 : 0;
                    });
                }
                else {
                    // Depreciated - remove in 1.11 (providing a plug-in option)
                    // Not all sort types have formatting methods, so we have to call their sorting
                    // methods.
                    displayMaster.sort(function (a, b) {
                        var
                            x, y, k, l, test, sort, fn,
                            len = aSort.length,
                            dataA = aoData[a]._aSortData,
                            dataB = aoData[b]._aSortData;

                        for (k = 0; k < len; k++) {
                            sort = aSort[k];

                            x = dataA[sort.col];
                            y = dataB[sort.col];

                            fn = oExtSort[sort.type + "-" + sort.dir] || oExtSort["string-" + sort.dir];
                            test = fn(x, y);
                            if (test !== 0) {
                                return test;
                            }
                        }

                        x = aiOrig[a];
                        y = aiOrig[b];
                        return x < y ? -1 : x > y ? 1 : 0;
                    });
                }
            }

            /* Tell the draw function that we have sorted the data */
            oSettings.bSorted = true;
        }


        function _fnSortAria(settings) {
            var label;
            var nextSort;
            var columns = settings.aoColumns;
            var aSort = _fnSortFlatten(settings);
            var oAria = settings.oLanguage.oAria;

            // ARIA attributes - need to loop all columns, to update all (removing old
            // attributes as needed)
            for (var i = 0, iLen = columns.length; i < iLen; i++) {
                var col = columns[i];
                var asSorting = col.asSorting;
                var sTitle = col.sTitle.replace(/<.*?>/g, "");
                var th = col.nTh;

                // IE7 is throwing an error when setting these properties with jQuery's
                // attr() and removeAttr() methods...
                th.removeAttribute('aria-sort');

                /* In ARIA only the first sorting column can be marked as sorting - no multi-sort option */
                if (col.bSortable) {
                    if (aSort.length > 0 && aSort[0].col == i) {
                        th.setAttribute('aria-sort', aSort[0].dir == "asc" ? "ascending" : "descending");
                        nextSort = asSorting[aSort[0].index + 1] || asSorting[0];
                    }
                    else {
                        nextSort = asSorting[0];
                    }

                    label = sTitle + ( nextSort === "asc" ?
                            oAria.sSortAscending :
                            oAria.sSortDescending
                    );
                }
                else {
                    label = sTitle;
                }

                th.setAttribute('aria-label', label);
            }
        }


        /**
         * Function to run on user sort request
         *  @param {object} settings dataTables settings object
         *  @param {node} attachTo node to attach the handler to
         *  @param {int} colIdx column sorting index
         *  @param {boolean} [append=false] Append the requested sort to the existing
         *    sort if true (i.e. multi-column sort)
         *  @param {function} [callback] callback function
         *  @memberof DataTable#oApi
         */
        function _fnSortListener(settings, colIdx, append, callback) {
            var col = settings.aoColumns[colIdx];
            var sorting = settings.aaSorting;
            var asSorting = col.asSorting;
            var nextSortIdx;
            var next = function (a) {
                var idx = a._idx;
                if (idx === undefined) {
                    idx = $.inArray(a[1], asSorting);
                }

                return idx + 1 >= asSorting.length ? 0 : idx + 1;
            };

            // If appending the sort then we are multi-column sorting
            if (append && settings.oFeatures.bSortMulti) {
                // Are we already doing some kind of sort on this column?
                var sortIdx = $.inArray(colIdx, _pluck(sorting, '0'));

                if (sortIdx !== -1) {
                    // Yes, modify the sort
                    nextSortIdx = next(sorting[sortIdx]);

                    sorting[sortIdx][1] = asSorting[nextSortIdx];
                    sorting[sortIdx]._idx = nextSortIdx;
                }
                else {
                    // No sort on this column yet
                    sorting.push([colIdx, asSorting[0], 0]);
                    sorting[sorting.length - 1]._idx = 0;
                }
            }
            else if (sorting.length && sorting[0][0] == colIdx) {
                // Single column - already sorting on this column, modify the sort
                nextSortIdx = next(sorting[0]);

                sorting.length = 1;
                sorting[0][1] = asSorting[nextSortIdx];
                sorting[0]._idx = nextSortIdx;
            }
            else {
                // Single column - sort only on this column
                sorting.length = 0;
                sorting.push([colIdx, asSorting[0]]);
                sorting[0]._idx = 0;
            }

            // Run the sort by calling a full redraw
            _fnReDraw(settings);

            // callback used for async user interaction
            if (typeof callback == 'function') {
                callback(settings);
            }
        }


        /**
         * Attach a sort handler (click) to a node
         *  @param {object} settings dataTables settings object
         *  @param {node} attachTo node to attach the handler to
         *  @param {int} colIdx column sorting index
         *  @param {function} [callback] callback function
         *  @memberof DataTable#oApi
         */
        function _fnSortAttachListener(settings, attachTo, colIdx, callback) {
            var col = settings.aoColumns[colIdx];

            _fnBindAction(attachTo, {}, function (e) {
                /* If the column is not sortable - don't to anything */
                if (col.bSortable === false) {
                    return;
                }

                _fnProcessingDisplay(settings, true);

                // Use a timeout to allow the processing display to be shown.
                setTimeout(function () {
                    _fnSortListener(settings, colIdx, e.shiftKey, callback);

                    // In server-side processing, the draw callback will remove the
                    // processing display
                    if (_fnDataSource(settings) !== 'ssp') {
                        _fnProcessingDisplay(settings, false);
                    }
                }, 0);
            });
        }


        /**
         * Set the sorting classes on table's body, Note: it is safe to call this function
         * when bSort and bSortClasses are false
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnSortingClasses(settings) {
            var oldSort = settings.aLastSort;
            var sortClass = settings.oClasses.sSortColumn;
            var sort = _fnSortFlatten(settings);
            var features = settings.oFeatures;
            var i, ien, colIdx;

            if (features.bSort && features.bSortClasses) {
                // Remove old sorting classes
                for (i = 0, ien = oldSort.length; i < ien; i++) {
                    colIdx = oldSort[i].src;

                    // Remove column sorting
                    $(_pluck(settings.aoData, 'anCells', colIdx))
                        .removeClass(sortClass + (i < 2 ? i + 1 : 3));
                }

                // Add new column sorting
                for (i = 0, ien = sort.length; i < ien; i++) {
                    colIdx = sort[i].src;

                    $(_pluck(settings.aoData, 'anCells', colIdx))
                        .addClass(sortClass + (i < 2 ? i + 1 : 3));
                }
            }

            settings.aLastSort = sort;
        }


        // Get the data to sort a column, be it from cache, fresh (populating the
        // cache), or from a sort formatter
        function _fnSortData(settings, idx) {
            // Custom sorting function - provided by the sort data type
            var column = settings.aoColumns[idx];
            var customSort = DataTable.ext.order[column.sSortDataType];
            var customData;

            if (customSort) {
                customData = customSort.call(settings.oInstance, settings, idx,
                    _fnColumnIndexToVisible(settings, idx)
                );
            }

            // Use / populate cache
            var row, cellData;
            var formatter = DataTable.ext.type.order[column.sType + "-pre"];

            for (var i = 0, ien = settings.aoData.length; i < ien; i++) {
                row = settings.aoData[i];

                if (!row._aSortData) {
                    row._aSortData = [];
                }

                if (!row._aSortData[idx] || customSort) {
                    cellData = customSort ?
                        customData[i] : // If there was a custom sort function, use data from there
                        _fnGetCellData(settings, i, idx, 'sort');

                    row._aSortData[idx] = formatter ?
                        formatter(cellData) :
                        cellData;
                }
            }
        }


        /**
         * Save the state of a table
         *  @param {object} oSettings dataTables settings object
         *  @memberof DataTable#oApi
         */
        function _fnSaveState(oSettings) {
            if (!oSettings.oFeatures.bStateSave || oSettings.bDestroying) {
                return;
            }

            /* Store the interesting variables */
            var i, iLen;
            var oState = {
                "iCreate": new Date().getTime(),
                "iStart": oSettings._iDisplayStart,
                "iLength": oSettings._iDisplayLength,
                "aaSorting": $.extend(true, [], oSettings.aaSorting),
                "oSearch": $.extend(true, {}, oSettings.oPreviousSearch),
                "aoSearchCols": $.extend(true, [], oSettings.aoPreSearchCols),
                "abVisCols": []
            };

            for (i = 0, iLen = oSettings.aoColumns.length; i < iLen; i++) {
                oState.abVisCols.push(oSettings.aoColumns[i].bVisible);
            }

            _fnCallbackFire(oSettings, "aoStateSaveParams", 'stateSaveParams', [oSettings, oState]);

            oSettings.fnStateSaveCallback.call(oSettings.oInstance, oSettings, oState);
        }


        /**
         * Attempt to load a saved table state
         *  @param {object} oSettings dataTables settings object
         *  @param {object} oInit DataTables init object so we can override settings
         *  @memberof DataTable#oApi
         */
        function _fnLoadState(oSettings, oInit) {
            var i, ien;
            var columns = oSettings.aoColumns;

            if (!oSettings.oFeatures.bStateSave) {
                return;
            }

            var oData = oSettings.fnStateLoadCallback.call(oSettings.oInstance, oSettings);
            if (!oData) {
                return;
            }

            /* Allow custom and plug-in manipulation functions to alter the saved data set and
		 * cancelling of loading by returning false
		 */
            var abStateLoad = _fnCallbackFire(oSettings, 'aoStateLoadParams', 'stateLoadParams', [oSettings, oData]);
            if ($.inArray(false, abStateLoad) !== -1) {
                return;
            }

            /* Reject old data */
            if (oData.iCreate < new Date().getTime() - (oSettings.iStateDuration * 1000)) {
                return;
            }

            // Number of columns have changed - all bets are off, no restore of settings
            if (columns.length !== oData.aoSearchCols.length) {
                return;
            }

            /* Store the saved state so it might be accessed at any time */
            oSettings.oLoadedState = $.extend(true, {}, oData);

            /* Restore key features */
            oSettings._iDisplayStart = oData.iStart;
            oSettings.iInitDisplayStart = oData.iStart;
            oSettings._iDisplayLength = oData.iLength;
            oSettings.aaSorting = [];

            var savedSort = oData.aaSorting;
            for (i = 0, ien = savedSort.length; i < ien; i++) {
                oSettings.aaSorting.push(savedSort[i][0] >= columns.length ?
                    [0, savedSort[i][1]] :
                    savedSort[i]
                );
            }

            /* Search filtering  */
            $.extend(oSettings.oPreviousSearch, oData.oSearch);
            $.extend(true, oSettings.aoPreSearchCols, oData.aoSearchCols);

            /* Column visibility state */
            for (i = 0, ien = oData.abVisCols.length; i < ien; i++) {
                columns[i].bVisible = oData.abVisCols[i];
            }

            _fnCallbackFire(oSettings, 'aoStateLoaded', 'stateLoaded', [oSettings, oData]);
        }


        /**
         * Return the settings object for a particular table
         *  @param {node} table table we are using as a dataTable
         *  @returns {object} Settings object - or null if not found
         *  @memberof DataTable#oApi
         */
        function _fnSettingsFromNode(table) {
            var settings = DataTable.settings;
            var idx = $.inArray(table, _pluck(settings, 'nTable'));

            return idx !== -1 ?
                settings[idx] :
                null;
        }


        /**
         * Log an error message
         *  @param {object} settings dataTables settings object
         *  @param {int} level log error messages, or display them to the user
         *  @param {string} msg error message
         *  @param {int} tn Technical note id to get more information about the error.
         *  @memberof DataTable#oApi
         */

        function _fnLog(settings, level, msg, tn) {

            //msg = '++DataTables warning: '+
            //(settings!==null ? 'table id='+settings.sTableId+' - ' : '')+msg;

            if (tn) {
                //msg += '. For more information about this error, please see '+
                'http://datatables.net/tn/' + tn;
            }


            if (!level) {
                // Backwards compatibility pre 1.10
                var ext = DataTable.ext;
                var type = ext.sErrMode || ext.errMode;

                if (type == 'alert') {
                    //alert( msg );
                }
                else {
                    throw new Error(msg);
                }
            }
            else if (window.console && console.log) {
            }
        }


        /**
         * See if a property is defined on one object, if so assign it to the other object
         *  @param {object} ret target object
         *  @param {object} src source object
         *  @param {string} name property
         *  @param {string} [mappedName] name to map too - optional, name used if not given
         *  @memberof DataTable#oApi
         */
        function _fnMap(ret, src, name, mappedName) {
            if ($.isArray(name)) {
                $.each(name, function (i, val) {
                    if ($.isArray(val)) {
                        _fnMap(ret, src, val[0], val[1]);
                    }
                    else {
                        _fnMap(ret, src, val);
                    }
                });

                return;
            }

            if (mappedName === undefined) {
                mappedName = name;
            }

            if (src[name] !== undefined) {
                ret[mappedName] = src[name];
            }
        }


        /**
         * Extend objects - very similar to jQuery.extend, but deep copy objects, and
         * shallow copy arrays. The reason we need to do this, is that we don't want to
         * deep copy array init values (such as aaSorting) since the dev wouldn't be
         * able to override them, but we do want to deep copy arrays.
         *  @param {object} out Object to extend
         *  @param {object} extender Object from which the properties will be applied to
         *      out
         *  @param {boolean} breakRefs If true, then arrays will be sliced to take an
         *      independent copy with the exception of the `data` or `aaData` parameters
         *      if they are present. This is so you can pass in a collection to
         *      DataTables and have that used as your data source without breaking the
         *      references
         *  @returns {object} out Reference, just for convenience - out === the return.
         *  @memberof DataTable#oApi
         *  @todo This doesn't take account of arrays inside the deep copied objects.
         */
        function _fnExtend(out, extender, breakRefs) {
            var val;

            for (var prop in extender) {
                if (extender.hasOwnProperty(prop)) {
                    val = extender[prop];

                    if ($.isPlainObject(val)) {
                        if (!$.isPlainObject(out[prop])) {
                            out[prop] = {};
                        }
                        $.extend(true, out[prop], val);
                    }
                    else if (breakRefs && prop !== 'data' && prop !== 'aaData' && $.isArray(val)) {
                        out[prop] = val.slice();
                    }
                    else {
                        out[prop] = val;
                    }
                }
            }

            return out;
        }


        /**
         * Bind an event handers to allow a click or return key to activate the callback.
         * This is good for accessibility since a return on the keyboard will have the
         * same effect as a click, if the element has focus.
         *  @param {element} n Element to bind the action to
         *  @param {object} oData Data object to pass to the triggered function
         *  @param {function} fn Callback function for when the event is triggered
         *  @memberof DataTable#oApi
         */
        function _fnBindAction(n, oData, fn) {
            $(n)
                .bind('click.DT', oData, function (e) {
                    n.blur(); // Remove focus outline for mouse users
                    fn(e);
                })
                .bind('keypress.DT', oData, function (e) {
                    if (e.which === 13) {
                        fn(e);
                    }
                })
                .bind('selectstart.DT', function () {
                    /* Take the brutal approach to cancelling text selection */
                    return false;
                });
        }


        /**
         * Register a callback function. Easily allows a callback function to be added to
         * an array store of callback functions that can then all be called together.
         *  @param {object} oSettings dataTables settings object
         *  @param {string} sStore Name of the array storage for the callbacks in oSettings
         *  @param {function} fn Function to be called back
         *  @param {string} sName Identifying name for the callback (i.e. a label)
         *  @memberof DataTable#oApi
         */
        function _fnCallbackReg(oSettings, sStore, fn, sName) {
            if (fn) {
                oSettings[sStore].push({
                    "fn": fn,
                    "sName": sName
                });
            }
        }


        /**
         * Fire callback functions and trigger events. Note that the loop over the
         * callback array store is done backwards! Further note that you do not want to
         * fire off triggers in time sensitive applications (for example cell creation)
         * as its slow.
         *  @param {object} settings dataTables settings object
         *  @param {string} callbackArr Name of the array storage for the callbacks in
         *      oSettings
         *  @param {string} event Name of the jQuery custom event to trigger. If null no
         *      trigger is fired
         *  @param {array} args Array of arguments to pass to the callback function /
         *      trigger
         *  @memberof DataTable#oApi
         */
        function _fnCallbackFire(settings, callbackArr, event, args) {
            var ret = [];

            if (callbackArr) {
                ret = $.map(settings[callbackArr].slice().reverse(), function (val, i) {
                    return val.fn.apply(settings.oInstance, args);
                });
            }

            if (event !== null) {
                $(settings.nTable).trigger(event + '.dt', args);
            }

            return ret;
        }


        function _fnLengthOverflow(settings) {
            var
                start = settings._iDisplayStart,
                end = settings.fnDisplayEnd(),
                len = settings._iDisplayLength;

            /* If we have space to show extra rows (backing up from the end point - then do so */
            if (end === settings.fnRecordsDisplay()) {
                start = end - len;
            }

            if (len === -1 || start < 0) {
                start = 0;
            }

            settings._iDisplayStart = start;
        }


        function _fnRenderer(settings, type) {
            var renderer = settings.renderer;
            var host = DataTable.ext.renderer[type];

            if ($.isPlainObject(renderer) && renderer[type]) {
                // Specific renderer for this type. If available use it, otherwise use
                // the default.
                return host[renderer[type]] || host._;
            }
            else if (typeof renderer === 'string') {
                // Common renderer - if there is one available for this type use it,
                // otherwise use the default
                return host[renderer] || host._;
            }

            // Use the default
            return host._;
        }


        /**
         * Detect the data source being used for the table. Used to simplify the code
         * a little (ajax) and to make it compress a little smaller.
         *
         *  @param {object} settings dataTables settings object
         *  @returns {string} Data source
         *  @memberof DataTable#oApi
         */
        function _fnDataSource(settings) {
            if (settings.oFeatures.bServerSide) {
                return 'ssp';
            }
            else if (settings.ajax || settings.sAjaxSource) {
                return 'ajax';
            }
            return 'dom';
        }


        DataTable = function (options) {
            /**
             * Perform a jQuery selector action on the table's TR elements (from the tbody) and
             * return the resulting jQuery object.
             *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
             *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
             *  @param {string} [oOpts.filter=none] Select TR elements that meet the current filter
             *    criterion ("applied") or all TR elements (i.e. no filter).
             *  @param {string} [oOpts.order=current] Order of the TR elements in the processed array.
             *    Can be either 'current', whereby the current sorting of the table is used, or
             *    'original' whereby the original order the data was read into the table is used.
             *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
             *    ("current") or not ("all"). If 'current' is given, then order is assumed to be
             *    'current' and filter is 'applied', regardless of what they might be given as.
             *  @returns {object} jQuery object, filtered by the given selector.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Highlight every second row
		 *      oTable.$('tr:odd').css('backgroundColor', 'blue');
		 *    } );
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Filter to rows with 'Webkit' in them, add a background colour and then
		 *      // remove the filter, thus highlighting the 'Webkit' rows only.
		 *      oTable.fnFilter('Webkit');
		 *      oTable.$('tr', {"search": "applied"}).css('backgroundColor', 'blue');
		 *      oTable.fnFilter('');
		 *    } );
             */
            this.$ = function (sSelector, oOpts) {
                return this.api(true).$(sSelector, oOpts);
            };


            /**
             * Almost identical to $ in operation, but in this case returns the data for the matched
             * rows - as such, the jQuery selector used should match TR row nodes or TD/TH cell nodes
             * rather than any descendants, so the data can be obtained for the row/cell. If matching
             * rows are found, the data returned is the original data array/object that was used to
             * create the row (or a generated array if from a DOM source).
             *
             * This method is often useful in-combination with $ where both functions are given the
             * same parameters and the array indexes will match identically.
             *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
             *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
             *  @param {string} [oOpts.filter=none] Select elements that meet the current filter
             *    criterion ("applied") or all elements (i.e. no filter).
             *  @param {string} [oOpts.order=current] Order of the data in the processed array.
             *    Can be either 'current', whereby the current sorting of the table is used, or
             *    'original' whereby the original order the data was read into the table is used.
             *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
             *    ("current") or not ("all"). If 'current' is given, then order is assumed to be
             *    'current' and filter is 'applied', regardless of what they might be given as.
             *  @returns {array} Data for the matched elements. If any elements, as a result of the
             *    selector, were not TR, TD or TH elements in the DataTable, they will have a null
             *    entry in the array.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Get the data from the first row in the table
		 *      var data = oTable._('tr:first');
		 *
		 *      // Do something useful with the data
		 *      alert( "First cell is: "+data[0] );
		 *    } );
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Filter to 'Webkit' and get all data for
		 *      oTable.fnFilter('Webkit');
		 *      var data = oTable._('tr', {"search": "applied"});
		 *
		 *      // Do something with the data
		 *      alert( data.length+" rows matched the search" );
		 *    } );
             */
            this._ = function (sSelector, oOpts) {
                return this.api(true).rows(sSelector, oOpts).data();
            };


            /**
             * Create a DataTables Api instance, with the currently selected tables for
             * the Api's context.
             * @param {boolean} [traditional=false] Set the API instance's context to be
             *   only the table referred to by the `DataTable.ext.iApiIndex` option, as was
             *   used in the API presented by DataTables 1.9- (i.e. the traditional mode),
             *   or if all tables captured in the jQuery object should be used.
             * @return {DataTables.Api}
             */
            this.api = function (traditional) {
                return traditional ?
                    new _Api(
                        _fnSettingsFromNode(this[_ext.iApiIndex])
                    ) :
                    new _Api(this);
            };


            /**
             * Add a single new row or multiple rows of data to the table. Please note
             * that this is suitable for client-side processing only - if you are using
             * server-side processing (i.e. "bServerSide": true), then to add data, you
             * must add it to the data source, i.e. the server-side, through an Ajax call.
             *  @param {array|object} data The data to be added to the table. This can be:
             *    <ul>
             *      <li>1D array of data - add a single row with the data provided</li>
             *      <li>2D array of arrays - add multiple rows in a single call</li>
             *      <li>object - data object when using <i>mData</i></li>
             *      <li>array of objects - multiple data objects when using <i>mData</i></li>
             *    </ul>
             *  @param {bool} [redraw=true] redraw the table or not
             *  @returns {array} An array of integers, representing the list of indexes in
             *    <i>aoData</i> ({@link DataTable.models.oSettings}) that have been added to
             *    the table.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    // Global var for counter
             *    var giCount = 2;
             *
             *    $(document).ready(function() {
		 *      $('#example').dataTable();
		 *    } );
             *
             *    function fnClickAddRow() {
		 *      $('#example').dataTable().fnAddData( [
		 *        giCount+".1",
		 *        giCount+".2",
		 *        giCount+".3",
		 *        giCount+".4" ]
		 *      );
		 *
		 *      giCount++;
		 *    }
             */
            this.fnAddData = function (data, redraw) {
                var api = this.api(true);

                /* Check if we want to add multiple rows or not */
                var rows = $.isArray(data) && ( $.isArray(data[0]) || $.isPlainObject(data[0]) ) ?
                    api.rows.add(data) :
                    api.row.add(data);

                if (redraw === undefined || redraw) {
                    api.draw();
                }

                return rows.flatten().toArray();
            };


            /**
             * This function will make DataTables recalculate the column sizes, based on the data
             * contained in the table and the sizes applied to the columns (in the DOM, CSS or
             * through the sWidth parameter). This can be useful when the width of the table's
             * parent element changes (for example a window resize).
             *  @param {boolean} [bRedraw=true] Redraw the table or not, you will typically want to
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "sScrollY": "200px",
		 *        "bPaginate": false
		 *      } );
		 *
		 *      $(window).bind('resize', function () {
		 *        oTable.fnAdjustColumnSizing();
		 *      } );
		 *    } );
             */
            this.fnAdjustColumnSizing = function (bRedraw) {
                var api = this.api(true).columns.adjust();
                var settings = api.settings()[0];
                var scroll = settings.oScroll;

                if (bRedraw === undefined || bRedraw) {
                    api.draw(false);
                }
                else if (scroll.sX !== "" || scroll.sY !== "") {
                    /* If not redrawing, but scrolling, we want to apply the new column sizes anyway */
                    _fnScrollDraw(settings);
                }
            };


            /**
             * Quickly and simply clear a table
             *  @param {bool} [bRedraw=true] redraw the table or not
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Immediately 'nuke' the current rows (perhaps waiting for an Ajax callback...)
		 *      oTable.fnClearTable();
		 *    } );
             */
            this.fnClearTable = function (bRedraw) {
                var api = this.api(true).clear();

                if (bRedraw === undefined || bRedraw) {
                    api.draw();
                }
            };


            /**
             * The exact opposite of 'opening' a row, this function will close any rows which
             * are currently 'open'.
             *  @param {node} nTr the table row to 'close'
             *  @returns {int} 0 on success, or 1 if failed (can't find the row)
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable;
		 *
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *
		 *      oTable = $('#example').dataTable();
		 *    } );
             */
            this.fnClose = function (nTr) {
                this.api(true).row(nTr).child.hide();
            };


            /**
             * Remove a row for the table
             *  @param {mixed} target The index of the row from aoData to be deleted, or
             *    the TR element you want to delete
             *  @param {function|null} [callBack] Callback function
             *  @param {bool} [redraw=true] Redraw the table or not
             *  @returns {array} The row that was deleted
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Immediately remove the first row
		 *      oTable.fnDeleteRow( 0 );
		 *    } );
             */
            this.fnDeleteRow = function (target, callback, redraw) {
                var api = this.api(true);
                var rows = api.rows(target);
                var settings = rows.settings()[0];
                var data = settings.aoData[rows[0][0]];

                rows.remove();

                if (callback) {
                    callback.call(this, settings, data);
                }

                if (redraw === undefined || redraw) {
                    api.draw();
                }

                return data;
            };


            /**
             * Restore the table to it's original state in the DOM by removing all of DataTables
             * enhancements, alterations to the DOM structure of the table and event listeners.
             *  @param {boolean} [remove=false] Completely remove the table from the DOM
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      // This example is fairly pointless in reality, but shows how fnDestroy can be used
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnDestroy();
		 *    } );
             */
            this.fnDestroy = function (remove) {
                this.api(true).destroy(remove);
            };


            /**
             * Redraw the table
             *  @param {bool} [complete=true] Re-filter and resort (if enabled) the table before the draw.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Re-draw the table - you wouldn't want to do it here, but it's an example :-)
		 *      oTable.fnDraw();
		 *    } );
             */
            this.fnDraw = function (complete) {
                // Note that this isn't an exact match to the old call to _fnDraw - it takes
                // into account the new data, but can old position.
                this.api(true).draw(!complete);
            };


            /**
             * Filter the input based on data
             *  @param {string} sInput String to filter the table on
             *  @param {int|null} [iColumn] Column to limit filtering to
             *  @param {bool} [bRegex=false] Treat as regular expression or not
             *  @param {bool} [bSmart=true] Perform smart filtering or not
             *  @param {bool} [bShowGlobal=true] Show the input global filter in it's input box(es)
             *  @param {bool} [bCaseInsensitive=true] Do case-insensitive matching (true) or not (false)
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Sometime later - filter...
		 *      oTable.fnFilter( 'test string' );
		 *    } );
             */
            this.fnFilter = function (sInput, iColumn, bRegex, bSmart, bShowGlobal, bCaseInsensitive) {
                var api = this.api(true);

                if (iColumn === null || iColumn === undefined) {
                    api.search(sInput, bRegex, bSmart, bCaseInsensitive);
                }
                else {
                    api.column(iColumn).search(sInput, bRegex, bSmart, bCaseInsensitive);
                }

                api.draw();
            };


            /**
             * Get the data for the whole table, an individual row or an individual cell based on the
             * provided parameters.
             *  @param {int|node} [src] A TR row node, TD/TH cell node or an integer. If given as
             *    a TR node then the data source for the whole row will be returned. If given as a
             *    TD/TH cell node then iCol will be automatically calculated and the data for the
             *    cell returned. If given as an integer, then this is treated as the aoData internal
             *    data index for the row (see fnGetPosition) and the data for that row used.
             *  @param {int} [col] Optional column index that you want the data of.
             *  @returns {array|object|string} If mRow is undefined, then the data for all rows is
             *    returned. If mRow is defined, just data for that row, and is iCol is
             *    defined, only data for the designated cell is returned.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    // Row data
             *    $(document).ready(function() {
		 *      oTable = $('#example').dataTable();
		 *
		 *      oTable.$('tr').click( function () {
		 *        var data = oTable.fnGetData( this );
		 *        // ... do something with the array / object of data for the row
		 *      } );
		 *    } );
             *
             *  @example
             *    // Individual cell data
             *    $(document).ready(function() {
		 *      oTable = $('#example').dataTable();
		 *
		 *      oTable.$('td').click( function () {
		 *        var sData = oTable.fnGetData( this );
		 *        alert( 'The cell clicked on had the value of '+sData );
		 *      } );
		 *    } );
             */
            this.fnGetData = function (src, col) {
                var api = this.api(true);

                if (src !== undefined) {
                    var type = src.nodeName ? src.nodeName.toLowerCase() : '';

                    return col !== undefined || type == 'td' || type == 'th' ?
                        api.cell(src, col).data() :
                        api.row(src).data();
                }

                return api.data().toArray();
            };


            /**
             * Get an array of the TR nodes that are used in the table's body. Note that you will
             * typically want to use the '$' API method in preference to this as it is more
             * flexible.
             *  @param {int} [iRow] Optional row index for the TR element you want
             *  @returns {array|node} If iRow is undefined, returns an array of all TR elements
             *    in the table's body, or iRow is defined, just the TR element requested.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Get the nodes from the table
		 *      var nNodes = oTable.fnGetNodes( );
		 *    } );
             */
            this.fnGetNodes = function (iRow) {
                var api = this.api(true);

                return iRow !== undefined ?
                    api.row(iRow).node() :
                    api.rows().nodes().toArray();
            };


            /**
             * Get the array indexes of a particular cell from it's DOM element
             * and column index including hidden columns
             *  @param {node} node this can either be a TR, TD or TH in the table's body
             *  @returns {int} If nNode is given as a TR, then a single index is returned, or
             *    if given as a cell, an array of [row index, column index (visible),
             *    column index (all)] is given.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      $('#example tbody td').click( function () {
		 *        // Get the position of the current data from the node
		 *        var aPos = oTable.fnGetPosition( this );
		 *
		 *        // Get the data array for this row
		 *        var aData = oTable.fnGetData( aPos[0] );
		 *
		 *        // Update the data array and return the value
		 *        aData[ aPos[1] ] = 'clicked';
		 *        this.innerHTML = 'clicked';
		 *      } );
		 *
		 *      // Init DataTables
		 *      oTable = $('#example').dataTable();
		 *    } );
             */
            this.fnGetPosition = function (node) {
                var api = this.api(true);
                var nodeName = node.nodeName.toUpperCase();

                if (nodeName == 'TR') {
                    return api.row(node).index();
                }
                else if (nodeName == 'TD' || nodeName == 'TH') {
                    var cell = api.cell(node).index();

                    return [
                        cell.row,
                        cell.columnVisible,
                        cell.column
                    ];
                }
                return null;
            };


            /**
             * Check to see if a row is 'open' or not.
             *  @param {node} nTr the table row to check
             *  @returns {boolean} true if the row is currently open, false otherwise
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable;
		 *
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *
		 *      oTable = $('#example').dataTable();
		 *    } );
             */
            this.fnIsOpen = function (nTr) {
                return this.api(true).row(nTr).child.isShown();
            };


            /**
             * This function will place a new row directly after a row which is currently
             * on display on the page, with the HTML contents that is passed into the
             * function. This can be used, for example, to ask for confirmation that a
             * particular record should be deleted.
             *  @param {node} nTr The table row to 'open'
             *  @param {string|node|jQuery} mHtml The HTML to put into the row
             *  @param {string} sClass Class to give the new TD cell
             *  @returns {node} The row opened. Note that if the table row passed in as the
             *    first parameter, is not found in the table, this method will silently
             *    return.
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable;
		 *
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *
		 *      oTable = $('#example').dataTable();
		 *    } );
             */
            this.fnOpen = function (nTr, mHtml, sClass) {
                return this.api(true).row(nTr).child(mHtml, sClass).show();
            };


            /**
             * Change the pagination - provides the internal logic for pagination in a simple API
             * function. With this function you can have a DataTables table go to the next,
             * previous, first or last pages.
             *  @param {string|int} mAction Paging action to take: "first", "previous", "next" or "last"
             *    or page number to jump to (integer), note that page 0 is the first page.
             *  @param {bool} [bRedraw=true] Redraw the table or not
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnPageChange( 'next' );
		 *    } );
             */
            this.fnPageChange = function (mAction, bRedraw) {
                var api = this.api(true).page(mAction);

                if (bRedraw === undefined || bRedraw) {
                    api.draw(false);
                }
            };


            /**
             * Show a particular column
             *  @param {int} iCol The column whose display should be changed
             *  @param {bool} bShow Show (true) or hide (false) the column
             *  @param {bool} [bRedraw=true] Redraw the table or not
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Hide the second column after initialisation
		 *      oTable.fnSetColumnVis( 1, false );
		 *    } );
             */
            this.fnSetColumnVis = function (iCol, bShow, bRedraw) {
                var api = this.api(true).column(iCol).visible(bShow);

                if (bRedraw === undefined || bRedraw) {
                    api.columns.adjust().draw();
                }
            };


            /**
             * Get the settings for a particular table for external manipulation
             *  @returns {object} DataTables settings object. See
             *    {@link DataTable.models.oSettings}
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      var oSettings = oTable.fnSettings();
		 *
		 *      // Show an example parameter from the settings
		 *      alert( oSettings._iDisplayStart );
		 *    } );
             */
            this.fnSettings = function () {
                return _fnSettingsFromNode(this[_ext.iApiIndex]);
            };


            /**
             * Sort the table by a particular column
             *  @param {int} iCol the data index to sort on. Note that this will not match the
             *    'display index' if you have hidden data entries
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Sort immediately with columns 0 and 1
		 *      oTable.fnSort( [ [0,'asc'], [1,'asc'] ] );
		 *    } );
             */
            this.fnSort = function (aaSort) {
                this.api(true).order(aaSort).draw();
            };


            /**
             * Attach a sort listener to an element for a given column
             *  @param {node} nNode the element to attach the sort listener to
             *  @param {int} iColumn the column that a click on this node will sort on
             *  @param {function} [fnCallback] callback function when sort is run
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Sort on column 1, when 'sorter' is clicked on
		 *      oTable.fnSortListener( document.getElementById('sorter'), 1 );
		 *    } );
             */
            this.fnSortListener = function (nNode, iColumn, fnCallback) {
                this.api(true).order.listener(nNode, iColumn, fnCallback);
            };


            /**
             * Update a table cell or row - this method will accept either a single value to
             * update the cell with, an array of values with one element for each column or
             * an object in the same format as the original data source. The function is
             * self-referencing in order to make the multi column updates easier.
             *  @param {object|array|string} mData Data to update the cell/row with
             *  @param {node|int} mRow TR element you want to update or the aoData index
             *  @param {int} [iColumn] The column to update, give as null or undefined to
             *    update a whole row.
             *  @param {bool} [bRedraw=true] Redraw the table or not
             *  @param {bool} [bAction=true] Perform pre-draw actions or not
             *  @returns {int} 0 on success, 1 on error
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnUpdate( 'Example update', 0, 0 ); // Single cell
		 *      oTable.fnUpdate( ['a', 'b', 'c', 'd', 'e'], $('tbody tr')[0] ); // Row
		 *    } );
             */
            this.fnUpdate = function (mData, mRow, iColumn, bRedraw, bAction) {
                var api = this.api(true);

                if (iColumn === undefined || iColumn === null) {
                    api.row(mRow).data(mData);
                }
                else {
                    api.cell(mRow, iColumn).data(mData);
                }

                if (bAction === undefined || bAction) {
                    api.columns.adjust();
                }

                if (bRedraw === undefined || bRedraw) {
                    api.draw();
                }
                return 0;
            };


            /**
             * Provide a common method for plug-ins to check the version of DataTables being used, in order
             * to ensure compatibility.
             *  @param {string} sVersion Version string to check for, in the format "X.Y.Z". Note that the
             *    formats "X" and "X.Y" are also acceptable.
             *  @returns {boolean} true if this version of DataTables is greater or equal to the required
             *    version, or false if this version of DataTales is not suitable
             *  @method
             *  @dtopt API
             *  @deprecated Since v1.10
             *
             *  @example
             *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      alert( oTable.fnVersionCheck( '1.9.0' ) );
		 *    } );
             */
            this.fnVersionCheck = _ext.fnVersionCheck;


            var _that = this;
            var emptyInit = options === undefined;
            var len = this.length;

            if (emptyInit) {
                options = {};
            }

            this.oApi = this.internal = _ext.internal;

            // Extend with old style plug-in API methods
            for (var fn in DataTable.ext.internal) {
                if (fn) {
                    this[fn] = _fnExternApiFunc(fn);
                }
            }

            this.each(function () {
                // For each initialisation we want to give it a clean initialisation
                // object that can be bashed around
                var o = {};
                var oInit = len > 1 ? // optimisation for single table case
                    _fnExtend(o, options, true) :
                    options;

                /*global oInit,_that,emptyInit*/
                var i = 0, iLen, j, jLen, k, kLen;
                var sId = this.getAttribute('id');
                var bInitHandedOff = false;
                var defaults = DataTable.defaults;


                /* Sanity check */
                if (this.nodeName.toLowerCase() != 'table') {
                    _fnLog(null, 0, 'Non-table node initialisation (' + this.nodeName + ')', 2);
                    return;
                }

                /* Backwards compatibility for the defaults */
                _fnCompatOpts(defaults);
                _fnCompatCols(defaults.column);

                /* Convert the camel-case defaults to Hungarian */
                _fnCamelToHungarian(defaults, defaults, true);
                _fnCamelToHungarian(defaults.column, defaults.column, true);

                /* Setting up the initialisation object */
                _fnCamelToHungarian(defaults, oInit);

                /* Check to see if we are re-initialising a table */
                var allSettings = DataTable.settings;
                for (i = 0, iLen = allSettings.length; i < iLen; i++) {
                    /* Base check on table node */
                    if (allSettings[i].nTable == this) {
                        var bRetrieve = oInit.bRetrieve !== undefined ? oInit.bRetrieve : defaults.bRetrieve;
                        var bDestroy = oInit.bDestroy !== undefined ? oInit.bDestroy : defaults.bDestroy;

                        if (emptyInit || bRetrieve) {
                            return allSettings[i].oInstance;
                        }
                        else if (bDestroy) {
                            allSettings[i].oInstance.fnDestroy();
                            break;
                        }
                        else {
                            _fnLog(allSettings[i], 0, 'Cannot reinitialise DataTable', 3);
                            return;
                        }
                    }

                    /* If the element we are initialising has the same ID as a table which was previously
				 * initialised, but the table nodes don't match (from before) then we destroy the old
				 * instance by simply deleting it. This is under the assumption that the table has been
				 * destroyed by other methods. Anyone using non-id selectors will need to do this manually
				 */
                    if (allSettings[i].sTableId == this.id) {
                        allSettings.splice(i, 1);
                        break;
                    }
                }

                /* Ensure the table has an ID - required for accessibility */
                if (sId === null || sId === "") {
                    sId = "DataTables_Table_" + (DataTable.ext._unique++);
                    this.id = sId;
                }

                /* Create the settings object for this table and set some of the default parameters */
                var oSettings = $.extend(true, {}, DataTable.models.oSettings, {
                    "nTable": this,
                    "oApi": _that.internal,
                    "oInit": oInit,
                    "sDestroyWidth": $(this)[0].style.width,
                    "sInstance": sId,
                    "sTableId": sId
                });
                allSettings.push(oSettings);

                // Need to add the instance after the instance after the settings object has been added
                // to the settings array, so we can self reference the table instance if more than one
                oSettings.oInstance = (_that.length === 1) ? _that : $(this).dataTable();

                // Backwards compatibility, before we apply all the defaults
                _fnCompatOpts(oInit);

                if (oInit.oLanguage) {
                    _fnLanguageCompat(oInit.oLanguage);
                }

                // If the length menu is given, but the init display length is not, use the length menu
                if (oInit.aLengthMenu && !oInit.iDisplayLength) {
                    oInit.iDisplayLength = $.isArray(oInit.aLengthMenu[0]) ?
                        oInit.aLengthMenu[0][0] : oInit.aLengthMenu[0];
                }

                // Apply the defaults and init options to make a single init object will all
                // options defined from defaults and instance options.
                oInit = _fnExtend($.extend(true, {}, defaults), oInit);


                // Map the initialisation options onto the settings object
                _fnMap(oSettings.oFeatures, oInit, [
                    "bPaginate",
                    "bLengthChange",
                    "bFilter",
                    "bSort",
                    "bSortMulti",
                    "bInfo",
                    "bProcessing",
                    "bAutoWidth",
                    "bSortClasses",
                    "bServerSide",
                    "bDeferRender"
                ]);
                _fnMap(oSettings, oInit, [
                    "asStripeClasses",
                    "ajax",
                    "fnServerData",
                    "fnFormatNumber",
                    "sServerMethod",
                    "aaSorting",
                    "aaSortingFixed",
                    "aLengthMenu",
                    "sPaginationType",
                    "sAjaxSource",
                    "sAjaxDataProp",
                    "iStateDuration",
                    "sDom",
                    "bSortCellsTop",
                    "iTabIndex",
                    "fnStateLoadCallback",
                    "fnStateSaveCallback",
                    "renderer",
                    ["iCookieDuration", "iStateDuration"], // backwards compat
                    ["oSearch", "oPreviousSearch"],
                    ["aoSearchCols", "aoPreSearchCols"],
                    ["iDisplayLength", "_iDisplayLength"],
                    ["bJQueryUI", "bJUI"]
                ]);
                _fnMap(oSettings.oScroll, oInit, [
                    ["sScrollX", "sX"],
                    ["sScrollXInner", "sXInner"],
                    ["sScrollY", "sY"],
                    ["bScrollCollapse", "bCollapse"]
                ]);
                _fnMap(oSettings.oLanguage, oInit, "fnInfoCallback");

                /* Callback functions which are array driven */
                _fnCallbackReg(oSettings, 'aoDrawCallback', oInit.fnDrawCallback, 'user');
                _fnCallbackReg(oSettings, 'aoServerParams', oInit.fnServerParams, 'user');
                _fnCallbackReg(oSettings, 'aoStateSaveParams', oInit.fnStateSaveParams, 'user');
                _fnCallbackReg(oSettings, 'aoStateLoadParams', oInit.fnStateLoadParams, 'user');
                _fnCallbackReg(oSettings, 'aoStateLoaded', oInit.fnStateLoaded, 'user');
                _fnCallbackReg(oSettings, 'aoRowCallback', oInit.fnRowCallback, 'user');
                _fnCallbackReg(oSettings, 'aoRowCreatedCallback', oInit.fnCreatedRow, 'user');
                _fnCallbackReg(oSettings, 'aoHeaderCallback', oInit.fnHeaderCallback, 'user');
                _fnCallbackReg(oSettings, 'aoFooterCallback', oInit.fnFooterCallback, 'user');
                _fnCallbackReg(oSettings, 'aoInitComplete', oInit.fnInitComplete, 'user');
                _fnCallbackReg(oSettings, 'aoPreDrawCallback', oInit.fnPreDrawCallback, 'user');

                // @todo Remove in 1.11
                if (oInit.bJQueryUI) {
                    /* Use the JUI classes object for display. You could clone the oStdClasses object if
				 * you want to have multiple tables with multiple independent classes
				 */
                    $.extend(oSettings.oClasses, DataTable.ext.oJUIClasses, oInit.oClasses);
                    if (oInit.sDom === defaults.sDom && defaults.sDom === "lfrtip") {
                        /* Set the DOM to use a layout suitable for jQuery UI's theming */
                        oSettings.sDom = '<"H"lfr>t<"F"ip>';
                    }

                    if (!oSettings.renderer) {
                        oSettings.renderer = 'jqueryui';
                    }
                    else if ($.isPlainObject(oSettings.renderer) && !oSettings.renderer.header) {
                        oSettings.renderer.header = 'jqueryui';
                    }
                }
                else {
                    $.extend(oSettings.oClasses, DataTable.ext.classes, oInit.oClasses);
                }
                $(this).addClass(oSettings.oClasses.sTable);

                /* Calculate the scroll bar width and cache it for use later on */
                if (oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "") {
                    oSettings.oScroll.iBarWidth = _fnScrollBarWidth();
                }
                if (oSettings.oScroll.sX === true) { // Easy initialisation of x-scrolling
                    oSettings.oScroll.sX = '100%';
                }

                if (oSettings.iInitDisplayStart === undefined) {
                    /* Display start point, taking into account the save saving */
                    oSettings.iInitDisplayStart = oInit.iDisplayStart;
                    oSettings._iDisplayStart = oInit.iDisplayStart;
                }

                if (oInit.iDeferLoading !== null) {
                    oSettings.bDeferLoading = true;
                    var tmp = $.isArray(oInit.iDeferLoading);
                    oSettings._iRecordsDisplay = tmp ? oInit.iDeferLoading[0] : oInit.iDeferLoading;
                    oSettings._iRecordsTotal = tmp ? oInit.iDeferLoading[1] : oInit.iDeferLoading;
                }

                /* Language definitions */
                if (oInit.oLanguage.sUrl !== "") {
                    /* Get the language definitions from a file - because this Ajax call makes the language
				 * get async to the remainder of this function we use bInitHandedOff to indicate that
				 * _fnInitialise will be fired by the returned Ajax handler, rather than the constructor
				 */
                    oSettings.oLanguage.sUrl = oInit.oLanguage.sUrl;
                    $.getJSON(oSettings.oLanguage.sUrl, null, function (json) {
                        _fnLanguageCompat(json);
                        _fnCamelToHungarian(defaults.oLanguage, json);
                        $.extend(true, oSettings.oLanguage, oInit.oLanguage, json);
                        _fnInitialise(oSettings);
                    });
                    bInitHandedOff = true;
                }
                else {
                    $.extend(true, oSettings.oLanguage, oInit.oLanguage);
                }


                /*
			 * Stripes
			 */
                if (oInit.asStripeClasses === null) {
                    oSettings.asStripeClasses = [
                        oSettings.oClasses.sStripeOdd,
                        oSettings.oClasses.sStripeEven
                    ];
                }

                /* Remove row stripe classes if they are already on the table row */
                var stripeClasses = oSettings.asStripeClasses;
                var rowOne = $('tbody tr:eq(0)', this);
                if ($.inArray(true, $.map(stripeClasses, function (el, i) {
                        return rowOne.hasClass(el);
                    })) !== -1) {
                    $('tbody tr', this).removeClass(stripeClasses.join(' '));
                    oSettings.asDestroyStripes = stripeClasses.slice();
                }

                /*
			 * Columns
			 * See if we should load columns automatically or use defined ones
			 */
                var anThs = [];
                var aoColumnsInit;
                var nThead = this.getElementsByTagName('thead');
                if (nThead.length !== 0) {
                    _fnDetectHeader(oSettings.aoHeader, nThead[0]);
                    anThs = _fnGetUniqueThs(oSettings);
                }

                /* If not given a column array, generate one with nulls */
                if (oInit.aoColumns === null) {
                    aoColumnsInit = [];
                    for (i = 0, iLen = anThs.length; i < iLen; i++) {
                        aoColumnsInit.push(null);
                    }
                }
                else {
                    aoColumnsInit = oInit.aoColumns;
                }

                /* Add the columns */
                for (i = 0, iLen = aoColumnsInit.length; i < iLen; i++) {
                    _fnAddColumn(oSettings, anThs ? anThs[i] : null);
                }

                /* Apply the column definitions */
                _fnApplyColumnDefs(oSettings, oInit.aoColumnDefs, aoColumnsInit, function (iCol, oDef) {
                    _fnColumnOptions(oSettings, iCol, oDef);
                });

                /* HTML5 attribute detection - build an mData object automatically if the
			 * attributes are found
			 */
                if (rowOne.length) {
                    var a = function (cell, name) {
                        return cell.getAttribute('data-' + name) ? name : null;
                    };

                    $.each(_fnGetRowElements(oSettings, rowOne[0]).cells, function (i, cell) {
                        var col = oSettings.aoColumns[i];

                        if (col.mData === i) {
                            var sort = a(cell, 'sort') || a(cell, 'order');
                            var filter = a(cell, 'filter') || a(cell, 'search');

                            if (sort !== null || filter !== null) {
                                col.mData = {
                                    _: i + '.display',
                                    sort: sort !== null ? i + '.@data-' + sort : undefined,
                                    type: sort !== null ? i + '.@data-' + sort : undefined,
                                    filter: filter !== null ? i + '.@data-' + filter : undefined
                                };

                                _fnColumnOptions(oSettings, i);
                            }
                        }
                    });
                }


                /* Must be done after everything which can be overridden by the state saving! */
                if (oInit.bStateSave) {
                    oSettings.oFeatures.bStateSave = true;
                    _fnLoadState(oSettings, oInit);
                    _fnCallbackReg(oSettings, 'aoDrawCallback', _fnSaveState, 'state_save');
                }


                /*
			 * Sorting
			 * @todo For modularisation (1.11) this needs to do into a sort start up handler
			 */

                // If aaSorting is not defined, then we use the first indicator in asSorting
                // in case that has been altered, so the default sort reflects that option
                if (oInit.aaSorting === undefined) {
                    for (i = 0, iLen = oSettings.aaSorting.length; i < iLen; i++) {
                        oSettings.aaSorting[i][1] = oSettings.aoColumns[i].asSorting[0];
                    }
                }

                /* Do a first pass on the sorting classes (allows any size changes to be taken into
			 * account, and also will apply sorting disabled classes if disabled
			 */
                _fnSortingClasses(oSettings);

                if (oSettings.oFeatures.bSort) {
                    _fnCallbackReg(oSettings, 'aoDrawCallback', function () {
                        if (oSettings.bSorted) {
                            var aSort = _fnSortFlatten(oSettings);
                            var sortedColumns = {};

                            $.each(aSort, function (i, val) {
                                sortedColumns[val.src] = val.dir;
                            });

                            _fnCallbackFire(oSettings, null, 'order', [oSettings, aSort, sortedColumns]);
                            _fnSortingClasses(oSettings);
                            _fnSortAria(oSettings);
                        }
                    });
                }


                /*
			 * Final init
			 * Cache the header, body and footer as required, creating them if needed
			 */

                /* Browser support detection */
                _fnBrowserDetect(oSettings);

                // Work around for Webkit bug 83867 - store the caption-side before removing from doc
                var captions = $(this).children('caption').each(function () {
                    this._captionSide = $(this).css('caption-side');
                });

                var thead = $(this).children('thead');
                if (thead.length === 0) {
                    thead = $('<thead/>').appendTo(this);
                }
                oSettings.nTHead = thead[0];

                var tbody = $(this).children('tbody');
                if (tbody.length === 0) {
                    tbody = $('<tbody/>').appendTo(this);
                }
                oSettings.nTBody = tbody[0];

                var tfoot = $(this).children('tfoot');
                if (tfoot.length === 0 && captions.length > 0 && (oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "")) {
                    // If we are a scrolling table, and no footer has been given, then we need to create
                    // a tfoot element for the caption element to be appended to
                    tfoot = $('<tfoot/>').appendTo(this);
                }

                if (tfoot.length === 0 || tfoot.children().length === 0) {
                    $(this).addClass(oSettings.oClasses.sNoFooter);
                }
                else if (tfoot.length > 0) {
                    oSettings.nTFoot = tfoot[0];
                    _fnDetectHeader(oSettings.aoFooter, oSettings.nTFoot);
                }

                /* Check if there is data passing into the constructor */
                if (oInit.aaData) {
                    for (i = 0; i < oInit.aaData.length; i++) {
                        _fnAddData(oSettings, oInit.aaData[i]);
                    }
                }
                else if (oSettings.bDeferLoading || _fnDataSource(oSettings) == 'dom') {
                    /* Grab the data from the page - only do this when deferred loading or no Ajax
				 * source since there is no point in reading the DOM data if we are then going
				 * to replace it with Ajax data
				 */
                    _fnAddTr(oSettings, $(oSettings.nTBody).children('tr'));
                }

                /* Copy the data index array */
                oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();

                /* Initialisation complete - table can be drawn */
                oSettings.bInitialised = true;

                /* Check if we need to initialise the table (it might not have been handed off to the
			 * language processor)
			 */
                if (bInitHandedOff === false) {
                    _fnInitialise(oSettings);
                }
            });
            _that = null;
            return this;
        };


        /**
         * Computed structure of the DataTables API, defined by the options passed to
         * `DataTable.Api.register()` when building the API.
         *
         * The structure is built in order to speed creation and extension of the Api
         * objects since the extensions are effectively pre-parsed.
         *
         * The array is an array of objects with the following structure, where this
         * base array represents the Api prototype base:
         *
         *     [
         *       {
	 *         name:      'data'                -- string   - Property name
	 *         val:       function () {},       -- function - Api method (or undefined if just an object
	 *         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	 *         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	 *       },
         *       {
	 *         name:     'row'
	 *         val:       {},
	 *         methodExt: [ ... ],
	 *         propExt:   [
	 *           {
	 *             name:      'data'
	 *             val:       function () {},
	 *             methodExt: [ ... ],
	 *             propExt:   [ ... ]
	 *           },
	 *           ...
	 *         ]
	 *       }
         *     ]
         *
         * @type {Array}
         * @ignore
         */
        var __apiStruct = [];


        /**
         * `Array.prototype` reference.
         *
         * @type object
         * @ignore
         */
        var __arrayProto = Array.prototype;


        /**
         * Abstraction for `context` parameter of the `Api` constructor to allow it to
         * take several different forms for ease of use.
         *
         * Each of the input parameter types will be converted to a DataTables settings
         * object where possible.
         *
         * @param  {string|node|jQuery|object} mixed DataTable identifier. Can be one
         *   of:
         *
         *   * `string` - jQuery selector. Any DataTables' matching the given selector
         *     with be found and used.
         *   * `node` - `TABLE` node which has already been formed into a DataTable.
         *   * `jQuery` - A jQuery object of `TABLE` nodes.
         *   * `object` - DataTables settings object
         *   * `DataTables.Api` - API instance
         * @return {array|null} Matching DataTables settings objects. `null` or
         *   `undefined` is returned if no matching DataTable is found.
         * @ignore
         */
        var _toSettings = function (mixed) {
            var idx, jq;
            var settings = DataTable.settings;
            var tables = $.map(settings, function (el, i) {
                return el.nTable;
            });

            if (!mixed) {
                return [];
            }
            else if (mixed.nTable && mixed.oApi) {
                // DataTables settings object
                return [mixed];
            }
            else if (mixed.nodeName && mixed.nodeName.toLowerCase() === 'table') {
                // Table node
                idx = $.inArray(mixed, tables);
                return idx !== -1 ? [settings[idx]] : null;
            }
            else if (mixed && typeof mixed.settings === 'function') {
                return mixed.settings();
            }
            else if (typeof mixed === 'string') {
                // jQuery selector
                jq = $(mixed);
            }
            else if (mixed instanceof $) {
                // jQuery object (also DataTables instance)
                jq = mixed;
            }

            if (jq) {
                return jq.map(function (i) {
                    idx = $.inArray(this, tables);
                    return idx !== -1 ? settings[idx] : null;
                }).toArray();
            }
        };


        /**
         * DataTables API class - used to control and interface with  one or more
         * DataTables enhanced tables.
         *
         * The API class is heavily based on jQuery, presenting a chainable interface
         * that you can use to interact with tables. Each instance of the API class has
         * a "context" - i.e. the tables that it will operate on. This could be a single
         * table, all tables on a page or a sub-set thereof.
         *
         * Additionally the API is designed to allow you to easily work with the data in
         * the tables, retrieving and manipulating it as required. This is done by
         * presenting the API class as an array like interface. The contents of the
         * array depend upon the actions requested by each method (for example
         * `rows().nodes()` will return an array of nodes, while `rows().data()` will
         * return an array of objects or arrays depending upon your table's
         * configuration). The API object has a number of array like methods (`push`,
         * `pop`, `reverse` etc) as well as additional helper methods (`each`, `pluck`,
         * `unique` etc) to assist your working with the data held in a table.
         *
         * Most methods (those which return an Api instance) are chainable, which means
         * the return from a method call also has all of the methods available that the
         * top level object had. For example, these two calls are equivalent:
         *
         *     // Not chained
         *     api.row.add( {...} );
         *     api.draw();
         *
         *     // Chained
         *     api.row.add( {...} ).draw();
         *
         * @class DataTable.Api
         * @param {array|object|string|jQuery} context DataTable identifier. This is
         *   used to define which DataTables enhanced tables this API will operate on.
         *   Can be one of:
         *
         *   * `string` - jQuery selector. Any DataTables' matching the given selector
         *     with be found and used.
         *   * `node` - `TABLE` node which has already been formed into a DataTable.
         *   * `jQuery` - A jQuery object of `TABLE` nodes.
         *   * `object` - DataTables settings object
         * @param {array} [data] Data to initialise the Api instance with.
         *
         * @example
         *   // Direct initialisation during DataTables construction
         *   var api = $('#example').DataTable();
         *
         * @example
         *   // Initialisation using a DataTables jQuery object
         *   var api = $('#example').dataTable().api();
         *
         * @example
         *   // Initialisation as a constructor
         *   var api = new $.fn.DataTable.Api( 'table.dataTable' );
         */
        DataTable.Api = _Api = function (context, data) {
            if (!this instanceof _Api) {
                throw 'DT API must be constructed as a new object';
                // or should it do the 'new' for the caller?
                // return new _Api.apply( this, arguments );
            }

            var settings = [];
            var ctxSettings = function (o) {
                var a = _toSettings(o);
                if (a) {
                    settings.push.apply(settings, a);
                }
            };

            if ($.isArray(context)) {
                for (var i = 0, ien = context.length; i < ien; i++) {
                    ctxSettings(context[i]);
                }
            }
            else {
                ctxSettings(context);
            }

            // Remove duplicates
            this.context = _unique(settings);

            // Initial data
            if (data) {
                this.push.apply(this, data.toArray ? data.toArray() : data);
            }

            // selector
            this.selector = {
                rows: null,
                cols: null,
                opts: null
            };

            _Api.extend(this, this, __apiStruct);
        };


        _Api.prototype = /** @lends DataTables.Api */{
            /**
             * Return a new Api instance, comprised of the data held in the current
             * instance, join with the other array(s) and/or value(s).
             *
             * An alias for `Array.prototype.concat`.
             *
             * @type method
             * @param {*} value1 Arrays and/or values to concatenate.
             * @param {*} [...] Additional arrays and/or values to concatenate.
             * @returns {DataTables.Api} New API instance, comprising of the combined
             *   array.
             */
            concat: __arrayProto.concat,


            context: [], // array of table settings objects


            each: function (fn) {
                if (__arrayProto.forEach) {
                    // Where possible, use the built-in forEach
                    __arrayProto.forEach.call(this, fn, this);
                }
                else {
                    // Compatibility for browsers without EMCA-252-5 (JS 1.6)
                    for (var i = 0, ien = this.length; i < ien; i++) {
                        // In strict mode the execution scope is the passed value
                        fn.call(this, this[i], i, this);
                    }
                }

                return this;
            },


            eq: function (idx) {
                var ctx = this.context;

                return ctx.length > idx ?
                    new _Api(ctx[idx], this[idx]) :
                    null;
            },


            filter: function (fn) {
                var a = [];

                if (__arrayProto.filter) {
                    a = __arrayProto.filter.call(this, fn, this);
                }
                else {
                    // Compatibility for browsers without EMCA-252-5 (JS 1.6)
                    for (var i = 0, ien = this.length; i < ien; i++) {
                        if (fn.call(this, this[i], i, this)) {
                            a.push(this[i]);
                        }
                    }
                }

                return new _Api(this.context, a);
            },


            flatten: function () {
                var a = [];
                return new _Api(this.context, a.concat.apply(a, this.toArray()));
            },


            join: __arrayProto.join,


            indexOf: __arrayProto.indexOf || function (obj, start) {
                for (var i = (start || 0), ien = this.length; i < ien; i++) {
                    if (this[i] === obj) {
                        return i;
                    }
                }
                return -1;
            },

            // Internal only at the moment - relax?
            iterator: function (flatten, type, fn) {
                var
                    a = [], ret,
                    i, ien, j, jen,
                    context = this.context,
                    rows, items, item,
                    selector = this.selector;

                // Argument shifting
                if (typeof flatten === 'string') {
                    fn = type;
                    type = flatten;
                    flatten = false;
                }

                for (i = 0, ien = context.length; i < ien; i++) {
                    if (type === 'table') {
                        ret = fn(context[i], i);

                        if (ret !== undefined) {
                            a.push(ret);
                        }
                    }
                    else if (type === 'columns' || type === 'rows') {
                        // this has same length as context - one entry for each table
                        ret = fn(context[i], this[i], i);

                        if (ret !== undefined) {
                            a.push(ret);
                        }
                    }
                    else if (type === 'column' || type === 'column-rows' || type === 'row' || type === 'cell') {
                        // columns and rows share the same structure.
                        // 'this' is an array of column indexes for each context
                        items = this[i];

                        if (type === 'column-rows') {
                            rows = _selector_row_indexes(context[i], selector.opts);
                        }

                        for (j = 0, jen = items.length; j < jen; j++) {
                            item = items[j];

                            if (type === 'cell') {
                                ret = fn(context[i], item.row, item.column, i, j);
                            }
                            else {
                                ret = fn(context[i], item, i, j, rows);
                            }

                            if (ret !== undefined) {
                                a.push(ret);
                            }
                        }
                    }
                }

                if (a.length) {
                    var api = new _Api(context, flatten ? a.concat.apply([], a) : a);
                    var apiSelector = api.selector;
                    apiSelector.rows = selector.rows;
                    apiSelector.cols = selector.cols;
                    apiSelector.opts = selector.opts;
                    return api;
                }
                return this;
            },


            lastIndexOf: __arrayProto.lastIndexOf || function (obj, start) {
                // Bit cheeky...
                return this.indexOf.apply(this.toArray.reverse(), arguments);
            },


            length: 0,


            map: function (fn) {
                var a = [];

                if (__arrayProto.map) {
                    a = __arrayProto.map.call(this, fn, this);
                }
                else {
                    // Compatibility for browsers without EMCA-252-5 (JS 1.6)
                    for (var i = 0, ien = this.length; i < ien; i++) {
                        a.push(fn.call(this, this[i], i));
                    }
                }

                return new _Api(this.context, a);
            },


            pluck: function (prop) {
                return this.map(function (el) {
                    return el[prop];
                });
            },

            pop: __arrayProto.pop,


            push: __arrayProto.push,


            // Does not return an API instance
            reduce: __arrayProto.reduce || function (fn, init) {
                var
                    value,
                    isSet = false;

                if (arguments.length > 1) {
                    value = init;
                    isSet = true;
                }

                for (var i = 0, ien = this.length; i < ien; i++) {
                    if (!this.hasOwnProperty(i)) {
                        continue;
                    }

                    value = isSet ?
                        fn(value, this[i], i, this) :
                        this[i];

                    isSet = true;
                }

                return value;
            },


            reduceRight: __arrayProto.reduceRight || function (fn, init) {
                var
                    value,
                    isSet = false;

                if (arguments.length > 1) {
                    value = init;
                    isSet = true;
                }

                for (var i = this.length - 1; i >= 0; i--) {
                    if (!this.hasOwnProperty(i)) {
                        continue;
                    }

                    value = isSet ?
                        fn(value, this[i], i, this) :
                        this[i];

                    isSet = true;
                }

                return value;
            },

            reverse: __arrayProto.reverse,


            // Object with rows, columns and opts
            selector: null,


            shift: __arrayProto.shift,


            sort: __arrayProto.sort, // ? name - order?


            splice: __arrayProto.splice,


            toArray: function () {
                return __arrayProto.slice.call(this);
            },


            to$: function () {
                return $(this);
            },


            toJQuery: function () {
                return $(this);
            },


            unique: function () {
                return new _Api(this.context, _unique(this));
            },


            unshift: __arrayProto.unshift
        };


        _Api.extend = function (scope, obj, ext) {
            // Only extend API instances and static properties of the API
            if (!obj || ( !(obj instanceof _Api) && !obj.__dt_wrapper )) {
                return;
            }

            var
                i, ien,
                j, jen,
                struct, inner,
                methodScoping = function (fn, struc) {
                    return function () {
                        var ret = fn.apply(scope, arguments);

                        // Method extension
                        _Api.extend(ret, ret, struc.methodExt);
                        return ret;
                    };
                };

            for (i = 0, ien = ext.length; i < ien; i++) {
                struct = ext[i];

                // Value
                obj[struct.name] = typeof struct.val === 'function' ?
                    methodScoping(struct.val, struct) :
                    struct.val;

                obj[struct.name].__dt_wrapper = true;

                // Property extension
                _Api.extend(scope, obj[struct.name], struct.propExt);
            }
        };


        // @todo - Is there need for an augment function?
        // _Api.augment = function ( inst, name )
        // {
        // 	// Find src object in the structure from the name
        // 	var parts = name.split('.');

        // 	_Api.extend( inst, obj );
        // };


        //     [
        //       {
        //         name:      'data'                -- string   - Property name
        //         val:       function () {},       -- function - Api method (or undefined if just an object
        //         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
        //         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
        //       },
        //       {
        //         name:     'row'
        //         val:       {},
        //         methodExt: [ ... ],
        //         propExt:   [
        //           {
        //             name:      'data'
        //             val:       function () {},
        //             methodExt: [ ... ],
        //             propExt:   [ ... ]
        //           },
        //           ...
        //         ]
        //       }
        //     ]

        _Api.register = _api_register = function (name, val) {
            if ($.isArray(name)) {
                for (var j = 0, jen = name.length; j < jen; j++) {
                    _Api.register(name[j], val);
                }
                return;
            }

            var
                i, ien,
                heir = name.split('.'),
                struct = __apiStruct,
                key, method;

            var find = function (src, name) {
                for (var i = 0, ien = src.length; i < ien; i++) {
                    if (src[i].name === name) {
                        return src[i];
                    }
                }
                return null;
            };

            for (i = 0, ien = heir.length; i < ien; i++) {
                method = heir[i].indexOf('()') !== -1;
                key = method ?
                    heir[i].replace('()', '') :
                    heir[i];

                var src = find(struct, key);
                if (!src) {
                    src = {
                        name: key,
                        val: {},
                        methodExt: [],
                        propExt: []
                    };
                    struct.push(src);
                }

                if (i === ien - 1) {
                    src.val = val;
                }
                else {
                    struct = method ?
                        src.methodExt :
                        src.propExt;
                }
            }

            // Rebuild the API with the new construct
            if (_Api.ready) {
                DataTable.api.build();
            }
        };


        _Api.registerPlural = _api_registerPlural = function (pluralName, singularName, val) {
            _Api.register(pluralName, val);

            _Api.register(singularName, function () {
                var ret = val.apply(this, arguments);

                if (ret === this) {
                    // Returned item is the API instance that was passed in, return it
                    return this;
                }
                else if (ret instanceof _Api) {
                    // New API instance returned, want the value from the first item
                    // in the returned array for the singular result.
                    return ret.length ?
                        $.isArray(ret[0]) ?
                            new _Api(ret.context, ret[0]) : // Array results are 'enhanced'
                            ret[0] :
                        undefined;
                }

                // Non-API return - just fire it back
                return ret;
            });
        };


        /**
         * Selector for HTML tables. Apply the given selector to the give array of
         * DataTables settings objects.
         *
         * @param {string|integer} [selector] jQuery selector string or integer
         * @param  {array} Array of DataTables settings objects to be filtered
         * @return {array}
         * @ignore
         */
        var __table_selector = function (selector, a) {
            // Integer is used to pick out a table by index
            if (typeof selector === 'number') {
                return [a[selector]];
            }

            // Perform a jQuery selector on the table nodes
            var nodes = $.map(a, function (el, i) {
                return el.nTable;
            });

            return $(nodes)
                .filter(selector)
                .map(function (i) {
                    // Need to translate back from the table node to the settings
                    var idx = $.inArray(this, nodes);
                    return a[idx];
                })
                .toArray();
        };


        /**
         * Context selector for the API's context (i.e. the tables the API instance
         * refers to.
         *
         * @name    DataTable.Api#tables
         * @param {string|integer} [selector] Selector to pick which tables the iterator
         *   should operate on. If not given, all tables in the current context are
         *   used. This can be given as a jQuery selector (for example `':gt(0)'`) to
         *   select multiple tables or as an integer to select a single table.
         * @returns {DataTable.Api} Returns a new API instance if a selector is given.
         */
        _api_register('tables()', function (selector) {
            // A new instance is created if there was a selector specified
            return selector ?
                new _Api(__table_selector(selector, this.context)) :
                this;
        });


        _api_register('table()', function (selector) {
            var tables = this.tables(selector);
            var ctx = tables.context;

            // Truncate to the first matched table
            return ctx.length ?
                new _Api(ctx[0]) :
                tables;
        });


        _api_registerPlural('tables().nodes()', 'table().node()', function () {
            return this.iterator('table', function (ctx) {
                return ctx.nTable;
            });
        });


        _api_registerPlural('tables().body()', 'table().body()', function () {
            return this.iterator('table', function (ctx) {
                return ctx.nTBody;
            });
        });


        _api_registerPlural('tables().header()', 'table().header()', function () {
            return this.iterator('table', function (ctx) {
                return ctx.nTHead;
            });
        });


        _api_registerPlural('tables().footer()', 'table().footer()', function () {
            return this.iterator('table', function (ctx) {
                return ctx.nTFoot;
            });
        });


        /**
         * Redraw the tables in the current context.
         *
         * @param {boolean} [reset=true] Reset (default) or hold the current paging
         *   position. A full re-sort and re-filter is performed when this method is
         *   called, which is why the pagination reset is the default action.
         * @returns {DataTables.Api} this
         */
        _api_register('draw()', function (resetPaging) {
            return this.iterator('table', function (settings) {
                _fnReDraw(settings, resetPaging === false);
            });
        });


        /**
         * Get the current page index.
         *
         * @return {integer} Current page index (zero based)
         */
        /**
         * Set the current page.
         *
         * Note that if you attempt to show a page which does not exist, DataTables will
         * not throw an error, but rather reset the paging.
         *
         * @param {integer|string} action The paging action to take. This can be one of:
         *  * `integer` - The page index to jump to
         *  * `string` - An action to take:
         *    * `first` - Jump to first page.
         *    * `next` - Jump to the next page
         *    * `previous` - Jump to previous page
         *    * `last` - Jump to the last page.
         * @returns {DataTables.Api} this
         */
        _api_register('page()', function (action) {
            if (action === undefined) {
                return this.page.info().page; // not an expensive call
            }

            // else, have an action to take on all tables
            return this.iterator('table', function (settings) {
                _fnPageChange(settings, action);
            });
        });


        /**
         * Paging information for the first table in the current context.
         *
         * If you require paging information for another table, use the `table()` method
         * with a suitable selector.
         *
         * @return {object} Object with the following properties set:
         *  * `page` - Current page index (zero based - i.e. the first page is `0`)
         *  * `pages` - Total number of pages
         *  * `start` - Display index for the first record shown on the current page
         *  * `end` - Display index for the last record shown on the current page
         *  * `length` - Display length (number of records). Note that generally `start
         *    + length = end`, but this is not always true, for example if there are
         *    only 2 records to show on the final page, with a length of 10.
         *  * `recordsTotal` - Full data set length
         *  * `recordsDisplay` - Data set length once the current filtering criterion
         *    are applied.
         */
        _api_register('page.info()', function (action) {
            if (this.context.length === 0) {
                return undefined;
            }

            var
                settings = this.context[0],
                start = settings._iDisplayStart,
                len = settings._iDisplayLength,
                visRecords = settings.fnRecordsDisplay(),
                all = len === -1;

            return {
                "page": all ? 0 : Math.floor(start / len),
                "pages": all ? 1 : Math.ceil(visRecords / len),
                "start": start,
                "end": settings.fnDisplayEnd(),
                "length": len,
                "recordsTotal": settings.fnRecordsTotal(),
                "recordsDisplay": visRecords
            };
        });


        /**
         * Get the current page length.
         *
         * @return {integer} Current page length. Note `-1` indicates that all records
         *   are to be shown.
         */
        /**
         * Set the current page length.
         *
         * @param {integer} Page length to set. Use `-1` to show all records.
         * @returns {DataTables.Api} this
         */
        _api_register('page.len()', function (len) {
            // Note that we can't call this function 'length()' because `length`
            // is a Javascript property of functions which defines how many arguments
            // the function expects.
            if (len === undefined) {
                return this.context.length !== 0 ?
                    this.context[0]._iDisplayLength :
                    undefined;
            }

            // else, set the page length
            return this.iterator('table', function (settings) {
                _fnLengthChange(settings, len);
            });
        });


        var __reload = function (settings, holdPosition, callback) {
            if (_fnDataSource(settings) == 'ssp') {
                _fnReDraw(settings, holdPosition);
            }
            else {
                // Trigger xhr
                _fnBuildAjax(settings, [], function (json) {
                    // xxx can this be reduced?
                    _fnClearTable(settings);

                    var data = _fnAjaxDataSrc(settings, json);
                    for (var i = 0, ien = data.length; i < ien; i++) {
                        _fnAddData(settings, data[i]);
                    }

                    _fnReDraw(settings, holdPosition);
                });
            }

            // Use the draw event to trigger a callback, regardless of if it is an async
            // or sync draw
            if (callback) {
                var api = new _Api(settings);

                api.one('draw', function () {
                    console.log(api.ajax.json());
                    callback(api.ajax.json());
                });
            }
        };


        /**
         * Get the JSON response from the last Ajax request that DataTables made to the
         * server. Note that this returns the JSON from the first table in the current
         * context.
         *
         * @return {object} JSON received from the server.
         */
        _api_register('ajax.json()', function () {
            var ctx = this.context;

            if (ctx.length > 0) {
                return ctx[0].json;
            }

            // else return undefined;
        });


        /**
         * Reload tables from the Ajax data source. Note that this function will
         * automatically re-draw the table when the remote data has been loaded.
         *
         * @param {boolean} [reset=true] Reset (default) or hold the current paging
         *   position. A full re-sort and re-filter is performed when this method is
         *   called, which is why the pagination reset is the default action.
         * @returns {DataTables.Api} this
         */
        _api_register('ajax.reload()', function (callback, resetPaging) {
            return this.iterator('table', function (settings) {
                __reload(settings, resetPaging === false, callback);
            });
        });


        /**
         * Get the current Ajax URL. Note that this returns the URL from the first
         * table in the current context.
         *
         * @return {string} Current Ajax source URL
         */
        /**
         * Set the Ajax URL. Note that this will set the URL for all tables in the
         * current context.
         *
         * @param {string} url URL to set.
         * @returns {DataTables.Api} this
         */
        _api_register('ajax.url()', function (url) {
            var ctx = this.context;

            if (url === undefined) {
                // get
                if (ctx.length === 0) {
                    return undefined;
                }
                ctx = ctx[0];

                return ctx.ajax ?
                    $.isPlainObject(ctx.ajax) ?
                        ctx.ajax.url :
                        ctx.ajax :
                    ctx.sAjaxSource;
            }

            // set
            return this.iterator('table', function (settings) {
                if ($.isPlainObject(settings.ajax)) {
                    settings.ajax.url = url;
                }
                else {
                    settings.ajax = url;
                }
                // No need to consider sAjaxSource here since DataTables gives priority
                // to `ajax` over `sAjaxSource`. So setting `ajax` here, renders any
                // value of `sAjaxSource` redundant.
            });
        });


        /**
         * Load data from the newly set Ajax URL. Note that this method is only
         * available when `ajax.url()` is used to set a URL. Additionally, this method
         * has the same effect as calling `ajax.reload()` but is provided for
         * convenience when setting a new URL. Like `ajax.reload()` it will
         * automatically redraw the table once the remote data has been loaded.
         *
         * @returns {DataTables.Api} this
         */
        _api_register('ajax.url().load()', function (callback, resetPaging) {
            // Same as a reload, but makes sense to present it for easy access after a
            // url change
            return this.iterator('table', function (ctx) {
                __reload(ctx, resetPaging === false, callback);
            });
        });


        var _selector_run = function (selector, select) {
            var
                out = [], res,
                a, i, ien, j, jen;

            if (!$.isArray(selector)) {
                selector = [selector];
            }

            for (i = 0, ien = selector.length; i < ien; i++) {
                a = selector[i] && selector[i].split ?
                    selector[i].split(',') :
                    [selector[i]];

                for (j = 0, jen = a.length; j < jen; j++) {
                    res = select(typeof a[j] === 'string' ? $.trim(a[j]) : a[j]);

                    if (res && res.length) {
                        out.push.apply(out, res);
                    }
                }
            }

            return out;
        };


        var _selector_opts = function (opts) {
            if (!opts) {
                opts = {};
            }

            // Backwards compatibility for 1.9- which used the terminology filter rather
            // than search
            if (opts.filter && !opts.search) {
                opts.search = opts.filter;
            }

            return {
                search: opts.search || 'none',
                order: opts.order || 'current',
                page: opts.page || 'all'
            };
        };


        var _selector_first = function (inst) {
            // Reduce the API instance to the first item found
            for (var i = 0, ien = inst.length; i < ien; i++) {
                if (inst[i].length > 0) {
                    // Assign the first element to the first item in the instance
                    // and truncate the instance and context
                    inst[0] = inst[i];
                    inst.length = 1;
                    inst.context = [inst.context[i]];

                    return inst;
                }
            }

            // Not found - return an empty instance
            inst.length = 0;
            return inst;
        };


        var _selector_row_indexes = function (settings, opts) {
            var
                i, ien, tmp, a = [],
                displayFiltered = settings.aiDisplay,
                displayMaster = settings.aiDisplayMaster;

            var
                search = opts.search,  // none, applied, removed
                order = opts.order,   // applied, current, index (original - compatibility with 1.9)
                page = opts.page;    // all, current

            if (_fnDataSource(settings) == 'ssp') {
                // In server-side processing mode, most options are irrelevant since
                // rows not shown don't exist and the index order is the applied order
                // Removed is a special case - for consistency just return an empty
                // array
                return search === 'removed' ?
                    [] :
                    _range(0, displayMaster.length);
            }
            else if (page == 'current') {
                // Current page implies that order=current and fitler=applied, since it is
                // fairly senseless otherwise, regardless of what order and search actually
                // are
                for (i = settings._iDisplayStart, ien = settings.fnDisplayEnd(); i < ien; i++) {
                    a.push(displayFiltered[i]);
                }
            }
            else if (order == 'current' || order == 'applied') {
                a = search == 'none' ?
                    displayMaster.slice() :                      // no search
                    search == 'applied' ?
                        displayFiltered.slice() :                // applied search
                        $.map(displayMaster, function (el, i) { // removed search
                            return $.inArray(el, displayFiltered) === -1 ? el : null;
                        });
            }
            else if (order == 'index' || order == 'original') {
                for (i = 0, ien = settings.aoData.length; i < ien; i++) {
                    if (search == 'none') {
                        a.push(i);
                    }
                    else { // applied | removed
                        tmp = $.inArray(i, displayFiltered);

                        if ((tmp === -1 && search == 'removed') ||
                            (tmp === 1 && search == 'applied')) {
                            a.push(i);
                        }
                    }
                }
            }

            return a;
        };


        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Rows
	 *
	 * {}          - no selector - use all available rows
	 * {integer}   - row aoData index
	 * {node}      - TR node
	 * {string}    - jQuery selector to apply to the TR elements
	 * {array}     - jQuery array of nodes, or simply an array of TR nodes
	 *
	 */


        var __row_selector = function (settings, selector, opts) {
            return _selector_run(selector, function (sel) {
                var selInt = _intVal(sel);

                // Short cut - selector is a number and no options provided (default is
                // all records, so no need to check if the index is in there, since it
                // must be - dev error if the index doesn't exist).
                if (selInt !== null && !opts) {
                    return [selInt];
                }

                var rows = _selector_row_indexes(settings, opts);

                if (selInt !== null && $.inArray(selInt, rows) !== -1) {
                    // Selector - integer
                    return [selInt];
                }
                else if (!sel) {
                    // Selector - none
                    return rows;
                }

                // Get nodes in the order from the `rows` array (can't use `pluck`) @todo - use pluck_order
                var nodes = [];
                for (var i = 0, ien = rows.length; i < ien; i++) {
                    nodes.push(settings.aoData[rows[i]].nTr);
                }

                if (sel.nodeName) {
                    // Selector - node
                    if ($.inArray(sel, nodes) !== -1) {
                        return [sel._DT_RowIndex];// sel is a TR node that is in the table
                        // and DataTables adds a prop for fast lookup
                    }
                }

                // Selector - jQuery selector string, array of nodes or jQuery object/
                // As jQuery's .filter() allows jQuery objects to be passed in filter,
                // it also allows arrays, so this will cope with all three options
                return $(nodes)
                    .filter(sel)
                    .map(function () {
                        return this._DT_RowIndex;
                    })
                    .toArray();
            });
        };


        /**
         *
         */
        _api_register('rows()', function (selector, opts) {
            // argument shifting
            if (selector === undefined) {
                selector = '';
            }
            else if ($.isPlainObject(selector)) {
                opts = selector;
                selector = '';
            }

            opts = _selector_opts(opts);

            var inst = this.iterator('table', function (settings) {
                return __row_selector(settings, selector, opts);
            });

            // Want argument shifting here and in __row_selector?
            inst.selector.rows = selector;
            inst.selector.opts = opts;

            return inst;
        });


        _api_register('rows().nodes()', function () {
            return this.iterator('row', function (settings, row) {
                return settings.aoData[row].nTr || undefined;
            });
        });

        _api_register('rows().data()', function () {
            return this.iterator(true, 'rows', function (settings, rows) {
                return _pluck_order(settings.aoData, rows, '_aData');
            });
        });

        _api_registerPlural('rows().cache()', 'row().cache()', function (type) {
            return this.iterator('row', function (settings, row) {
                var r = settings.aoData[row];
                return type === 'search' ? r._aFilterData : r._aSortData;
            });
        });

        _api_registerPlural('rows().invalidate()', 'row().invalidate()', function (src) {
            return this.iterator('row', function (settings, row) {
                _fnInvalidateRow(settings, row, src);
            });
        });

        _api_registerPlural('rows().indexes()', 'row().index()', function () {
            return this.iterator('row', function (settings, row) {
                return row;
            });
        });

        _api_registerPlural('rows().remove()', 'row().remove()', function () {
            var that = this;

            return this.iterator('row', function (settings, row, thatIdx) {
                var data = settings.aoData;

                data.splice(row, 1);

                // Update the _DT_RowIndex parameter on all rows in the table
                for (var i = 0, ien = data.length; i < ien; i++) {
                    if (data[i].nTr !== null) {
                        data[i].nTr._DT_RowIndex = i;
                    }
                }

                // Remove the target row from the search array
                var displayIndex = $.inArray(row, settings.aiDisplay);

                // Delete from the display arrays
                _fnDeleteIndex(settings.aiDisplayMaster, row);
                _fnDeleteIndex(settings.aiDisplay, row);
                _fnDeleteIndex(that[thatIdx], row, false); // maintain local indexes

                // Check for an 'overflow' they case for displaying the table
                _fnLengthOverflow(settings);
            });
        });


        _api_register('rows.add()', function (rows) {
            var newRows = this.iterator('table', function (settings) {
                var row, i, ien;
                var out = [];

                for (i = 0, ien = rows.length; i < ien; i++) {
                    row = rows[i];

                    if (row.nodeName && row.nodeName.toUpperCase() === 'TR') {
                        out.push(_fnAddTr(settings, row)[0]);
                    }
                    else {
                        out.push(_fnAddData(settings, row));
                    }
                }

                return out;
            });

            // Return an Api.rows() extended instance, so rows().nodes() etc can be used
            var modRows = this.rows(-1);
            modRows.pop();
            modRows.push.apply(modRows, newRows.toArray());

            return modRows;
        });


        /**
         *
         */
        _api_register('row()', function (selector, opts) {
            return _selector_first(this.rows(selector, opts));
        });


        _api_register('row().data()', function (data) {
            var ctx = this.context;

            if (data === undefined) {
                // Get
                return ctx.length && this.length ?
                    ctx[0].aoData[this[0]]._aData :
                    undefined;
            }

            // Set
            ctx[0].aoData[this[0]]._aData = data;

            // Automatically invalidate
            _fnInvalidateRow(ctx[0], this[0], 'data');

            return this;
        });


        _api_register('row().node()', function () {
            var ctx = this.context;

            return ctx.length && this.length ?
                ctx[0].aoData[this[0]].nTr || null :
                null;
        });


        _api_register('row.add()', function (row) {
            // Allow a jQuery object to be passed in - only a single row is added from
            // it though - the first element in the set
            if (row instanceof $ && row.length) {
                row = row[0];
            }

            var rows = this.iterator('table', function (settings) {
                if (row.nodeName && row.nodeName.toUpperCase() === 'TR') {
                    return _fnAddTr(settings, row)[0];
                }
                return _fnAddData(settings, row);
            });

            // Return an Api.rows() extended instance, with the newly added row selected
            return this.row(rows[0]);
        });


        var __details_add = function (ctx, row, data, klass) {
            // Convert to array of TR elements
            var rows = [];
            var addRow = function (r, k) {
                if (!r.nodeName || r.nodeName.toUpperCase() !== 'tr') {
                    r = $('<tr><td></td></tr>').find('td').html(r).parent();
                }

                $('td', r).addClass(k)[0].colSpan = _fnVisbleColumns(ctx);
                rows.push(r[0]);
            };

            if ($.isArray(data) || data instanceof $) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    addRow(data[i], klass);
                }
            }
            else {
                addRow(data, klass);
            }

            if (row._details) {
                row._details.remove();
            }

            row._details = $(rows);

            // If the children were already shown, that state should be retained
            if (row._detailsShow) {
                row._details.insertAfter(row.nTr);
            }
        };


        var __details_display = function (show) {
            var ctx = this.context;

            if (ctx.length && this.length) {
                var row = ctx[0].aoData[this[0]];

                if (row._details) {
                    row._detailsShow = show;
                    if (show) {
                        row._details.insertAfter(row.nTr);
                    }
                    else {
                        row._details.remove();
                    }

                    __details_events(ctx[0]);
                }
            }

            return this;
        };


        var __details_events = function (settings) {
            var api = new _Api(settings);
            var namespace = '.dt.DT_details';
            var drawEvent = 'draw' + namespace;
            var colvisEvent = 'column-visibility' + namespace;

            api.off(drawEvent + ' ' + colvisEvent);

            if (_pluck(settings.aoData, '_details').length > 0) {
                // On each draw, insert the required elements into the document
                api.on(drawEvent, function () {
                    api.rows({page: 'current'}).eq(0).each(function (idx) {
                        // Internal data grab
                        var row = settings.aoData[idx];

                        if (row._detailsShow) {
                            row._details.insertAfter(row.nTr);
                        }
                    });
                });

                // Column visibility change - update the colspan
                api.on(colvisEvent, function (e, settings, idx, vis) {
                    // Update the colspan for the details rows (note, only if it already has
                    // a colspan)
                    var row, visible = _fnVisbleColumns(settings);

                    for (var i = 0, ien = settings.aoData.length; i < ien; i++) {
                        row = settings.aoData[i];

                        if (row._details) {
                            row._details.children('td[colspan]').attr('colspan', visible);
                        }
                    }
                });
            }
        };

        // data can be:
        //  tr
        //  string
        //  jQuery or array of any of the above
        _api_register('row().child()', function (data, klass) {
            var ctx = this.context;

            if (data === undefined) {
                // get
                return ctx.length && this.length ?
                    ctx[0].aoData[this[0]]._details :
                    undefined;
            }
            else if (ctx.length && this.length) {
                // set
                __details_add(ctx[0], ctx[0].aoData[this[0]], data, klass);
            }

            return this;
        });

        _api_register([
            'row().child.show()',
            'row().child().show()'
        ], function () {
            __details_display.call(this, true);
        });

        _api_register([
            'row().child.hide()',
            'row().child().hide()'
        ], function () {
            __details_display.call(this, false);
        });

        _api_register('row().child.isShown()', function () {
            var ctx = this.context;

            if (ctx.length && this.length) {
                // _detailsShown as false or undefined will fall through to return false
                return ctx[0].aoData[this[0]]._detailsShow || false;
            }
            return false;
        });


        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Columns
	 *
	 * {integer}           - column index (>=0 count from left, <0 count from right)
	 * "{integer}:visIdx"  - visible column index (i.e. translate to column index)  (>=0 count from left, <0 count from right)
	 * "{integer}:visible" - alias for {integer}:visIdx  (>=0 count from left, <0 count from right)
	 * "{string}:name"     - column name
	 * "{string}"          - jQuery selector on column header nodes
	 *
	 */

        // can be an array of these items, comma separated list, or an array of comma
        // separated lists

        var __re_column_selector = /^(.*):(name|visIdx|visible)$/;

        var __column_selector = function (settings, selector, opts) {
            var
                columns = settings.aoColumns,
                names = _pluck(columns, 'sName'),
                nodes = _pluck(columns, 'nTh');

            return _selector_run(selector, function (s) {
                var selInt = _intVal(s);

                if (s === '') {
                    // All columns
                    return _range(columns.length);
                }
                else if (selInt !== null) {
                    // Integer selector
                    return [selInt >= 0 ?
                        selInt : // Count from left
                        columns.length + selInt // Count from right (+ because its a negative value)
                    ];
                }
                else {
                    var match = s.match(__re_column_selector);

                    if (match) {
                        switch (match[2]) {
                            case 'visIdx':
                            case 'visible':
                                var idx = parseInt(match[1], 10);
                                // Visible index given, convert to column index
                                if (idx < 0) {
                                    // Counting from the right
                                    var visColumns = $.map(columns, function (col, i) {
                                        return col.bVisible ? i : null;
                                    });
                                    return [visColumns[visColumns.length + idx]];
                                }
                                // Counting from the left
                                return [_fnVisibleToColumnIndex(settings, idx)];

                            case 'name':
                                // match by name. `names` is column index complete and in order
                                return $.map(names, function (name, i) {
                                    return name === match[1] ? i : null;
                                });
                        }
                    }
                    else {
                        // jQuery selector on the TH elements for the columns
                        return $(nodes)
                            .filter(s)
                            .map(function () {
                                return $.inArray(this, nodes); // `nodes` is column index complete and in order
                            })
                            .toArray();
                    }
                }
            });
        };


        var __setColumnVis = function (settings, column, vis) {
            var
                cols = settings.aoColumns,
                col = cols[column],
                data = settings.aoData,
                row, cells, i, ien, tr;

            // Get
            if (vis === undefined) {
                return col.bVisible;
            }

            // Set
            // No change
            if (col.bVisible === vis) {
                return;
            }

            if (vis) {
                // Insert column
                // Need to decide if we should use appendChild or insertBefore
                var insertBefore = $.inArray(true, _pluck(cols, 'bVisible'), column + 1);

                for (i = 0, ien = data.length; i < ien; i++) {
                    tr = data[i].nTr;
                    cells = data[i].anCells;

                    if (tr) {
                        // insertBefore can act like appendChild if 2nd arg is null
                        tr.insertBefore(cells[column], cells[insertBefore] || null);
                    }
                }
            }
            else {
                // Remove column
                $(_pluck(settings.aoData, 'anCells', column)).detach();

                col.bVisible = false;
                _fnDrawHead(settings, settings.aoHeader);
                _fnDrawHead(settings, settings.aoFooter);

                _fnSaveState(settings);
            }

            // Common actions
            col.bVisible = vis;
            _fnDrawHead(settings, settings.aoHeader);
            _fnDrawHead(settings, settings.aoFooter);

            // Automatically adjust column sizing
            _fnAdjustColumnSizing(settings);

            // Realign columns for scrolling
            if (settings.oScroll.sX || settings.oScroll.sY) {
                _fnScrollDraw(settings);
            }

            _fnCallbackFire(settings, null, 'column-visibility', [settings, column, vis]);

            _fnSaveState(settings);
        };


        /**
         *
         */
        _api_register('columns()', function (selector, opts) {
            // argument shifting
            if (selector === undefined) {
                selector = '';
            }
            else if ($.isPlainObject(selector)) {
                opts = selector;
                selector = '';
            }

            opts = _selector_opts(opts);

            var inst = this.iterator('table', function (settings) {
                return __column_selector(settings, selector, opts);
            });

            // Want argument shifting here and in _row_selector?
            inst.selector.cols = selector;
            inst.selector.opts = opts;

            return inst;
        });


        /**
         *
         */
        _api_registerPlural('columns().header()', 'column().header()', function (selector, opts) {
            return this.iterator('column', function (settings, column) {
                return settings.aoColumns[column].nTh;
            });
        });


        /**
         *
         */
        _api_registerPlural('columns().footer()', 'column().footer()', function (selector, opts) {
            return this.iterator('column', function (settings, column) {
                return settings.aoColumns[column].nTf;
            });
        });


        /**
         *
         */
        _api_registerPlural('columns().data()', 'column().data()', function () {
            return this.iterator('column-rows', function (settings, column, i, j, rows) {
                var a = [];
                for (var row = 0, ien = rows.length; row < ien; row++) {
                    a.push(_fnGetCellData(settings, rows[row], column, ''));
                }
                return a;
            });
        });


        _api_registerPlural('columns().cache()', 'column().cache()', function (type) {
            return this.iterator('column-rows', function (settings, column, i, j, rows) {
                return _pluck_order(settings.aoData, rows,
                    type === 'search' ? '_aFilterData' : '_aSortData', column
                );
            });
        });


        _api_registerPlural('columns().nodes()', 'column().nodes()', function () {
            return this.iterator('column-rows', function (settings, column, i, j, rows) {
                return _pluck_order(settings.aoData, rows, 'anCells', column);
            });
        });


        _api_registerPlural('columns().visible()', 'column().visible()', function (vis) {
            return this.iterator('column', function (settings, column) {
                return __setColumnVis(settings, column, vis);
            });
        });


        _api_registerPlural('columns().indexes()', 'column().index()', function (type) {
            return this.iterator('column', function (settings, column) {
                return type === 'visible' ?
                    _fnColumnIndexToVisible(settings, column) :
                    column;
            });
        });


        // _api_register( 'columns().show()', function () {
        // 	var selector = this.selector;
        // 	return this.columns( selector.cols, selector.opts ).visible( true );
        // } );


        // _api_register( 'columns().hide()', function () {
        // 	var selector = this.selector;
        // 	return this.columns( selector.cols, selector.opts ).visible( false );
        // } );


        _api_register('columns.adjust()', function () {
            return this.iterator('table', function (settings) {
                _fnAdjustColumnSizing(settings);
            });
        });


        // Convert from one column index type, to another type
        _api_register('column.index()', function (type, idx) {
            if (this.context.length !== 0) {
                var ctx = this.context[0];

                if (type === 'fromVisible' || type === 'toData') {
                    return _fnColumnIndexToVisible(ctx, idx);
                }
                else if (type === 'fromData' || type === 'toVisible') {
                    return _fnVisibleToColumnIndex(ctx, idx);
                }
            }
        });


        _api_register('column()', function (selector, opts) {
            return _selector_first(this.columns(selector, opts));
        });


        var __cell_selector = function (settings, selector, opts) {
            var data = settings.aoData;
            var rows = _selector_row_indexes(settings, opts);
            var cells = _pluck_order(data, rows, 'anCells');
            var allCells = $([].concat.apply([], cells));
            var row;
            var columns = settings.aoColumns.length;
            var a, i, ien, j;

            return _selector_run(selector, function (s) {
                if (!s) {
                    // All cells
                    a = [];

                    for (i = 0, ien = rows.length; i < ien; i++) {
                        row = rows[i];

                        for (j = 0; j < columns; j++) {
                            a.push({
                                row: row,
                                column: j
                            });
                        }
                    }

                    return a;
                }

                // jQuery filtered cells
                return allCells.filter(s).map(function (i, el) {
                    row = el.parentNode._DT_RowIndex;

                    return {
                        row: row,
                        column: $.inArray(el, data[row].anCells)
                    };
                });
            });
        };


        _api_register('cells()', function (rowSelector, columnSelector, opts) {
            // Argument shifting
            if ($.isPlainObject(rowSelector)) {
                opts = rowSelector;
                rowSelector = null;
            }
            if ($.isPlainObject(columnSelector)) {
                opts = columnSelector;
                columnSelector = null;
            }

            // Cell selector
            if (columnSelector === null || columnSelector === undefined) {
                return this.iterator('table', function (settings) {
                    return __cell_selector(settings, rowSelector, _selector_opts(opts));
                });
            }

            // Row + column selector
            var columns = this.columns(columnSelector, opts);
            var rows = this.rows(rowSelector, opts);
            var a, i, ien, j, jen;

            var cells = this.iterator('table', function (settings, idx) {
                a = [];

                for (i = 0, ien = rows[idx].length; i < ien; i++) {
                    for (j = 0, jen = columns[idx].length; j < jen; j++) {
                        a.push({
                            row: rows[idx][i],
                            column: columns[idx][j]
                        });
                    }
                }

                return a;
            });

            $.extend(cells.selector, {
                cols: columnSelector,
                rows: rowSelector,
                opts: opts
            });

            return cells;
        });


        _api_registerPlural('cells().nodes()', 'cell().node()', function () {
            return this.iterator('cell', function (settings, row, column) {
                return settings.aoData[row].anCells[column];
            });
        });


        _api_register('cells().data()', function () {
            return this.iterator('cell', function (settings, row, column) {
                return _fnGetCellData(settings, row, column);
            });
        });


        _api_registerPlural('cells().cache()', 'cell().cache()', function (type) {
            type = type === 'search' ? '_aFilterData' : '_aSortData';

            return this.iterator('cell', function (settings, row, column) {
                return settings.aoData[row][type][column];
            });
        });


        _api_registerPlural('cells().indexes()', 'cell().index()', function () {
            return this.iterator('cell', function (settings, row, column) {
                return {
                    row: row,
                    column: column,
                    columnVisible: _fnColumnIndexToVisible(settings, column)
                };
            });
        });


        _api_register([
            'cells().invalidate()',
            'cell().invalidate()'
        ], function (src) {
            var selector = this.selector;

            // Use the rows method of the instance to perform the invalidation, rather
            // than doing it here. This avoids needing to handle duplicate rows from
            // the cells.
            this.rows(selector.rows, selector.opts).invalidate(src);

            return this;
        });


        _api_register('cell()', function (rowSelector, columnSelector, opts) {
            return _selector_first(this.cells(rowSelector, columnSelector, opts));
        });


        _api_register('cell().data()', function (data) {
            var ctx = this.context;
            var cell = this[0];

            if (data === undefined) {
                // Get
                return ctx.length && cell.length ?
                    _fnGetCellData(ctx[0], cell[0].row, cell[0].column) :
                    undefined;
            }

            // Set
            _fnSetCellData(ctx[0], cell[0].row, cell[0].column, data);
            _fnInvalidateRow(ctx[0], cell[0].row, 'data', cell[0].column);

            return this;
        });


        /**
         * Get current ordering (sorting) that has been applied to the table.
         *
         * @returns {array} 2D array containing the sorting information for the first
         *   table in the current context. Each element in the parent array represents
         *   a column being sorted upon (i.e. multi-sorting with two columns would have
         *   2 inner arrays). The inner arrays may have 2 or 3 elements. The first is
         *   the column index that the sorting condition applies to, the second is the
         *   direction of the sort (`desc` or `asc`) and, optionally, the third is the
         *   index of the sorting order from the `column.sorting` initialisation array.
         */
        /**
         * Set the ordering for the table.
         *
         * @param {integer} order Column index to sort upon.
         * @param {string} direction Direction of the sort to be applied (`asc` or `desc`)
         * @returns {DataTables.Api} this
         */
        /**
         * Set the ordering for the table.
         *
         * @param {array} order 1D array of sorting information to be applied.
         * @param {array} [...] Optional additional sorting conditions
         * @returns {DataTables.Api} this
         */
        /**
         * Set the ordering for the table.
         *
         * @param {array} order 2D array of sorting information to be applied.
         * @returns {DataTables.Api} this
         */
        _api_register('order()', function (order, dir) {
            var ctx = this.context;

            if (order === undefined) {
                // get
                return ctx.length !== 0 ?
                    ctx[0].aaSorting :
                    undefined;
            }

            // set
            if (typeof order === 'number') {
                // Simple column / direction passed in
                order = [[order, dir]];
            }
            else if (!$.isArray(order[0])) {
                // Arguments passed in (list of 1D arrays)
                order = Array.prototype.slice.call(arguments);
            }
            // otherwise a 2D array was passed in

            return this.iterator('table', function (settings) {
                settings.aaSorting = order.slice();
            });
        });


        /**
         * Attach a sort listener to an element for a given column
         *
         * @param {node|jQuery|string} node Identifier for the element(s) to attach the
         *   listener to. This can take the form of a single DOM node, a jQuery
         *   collection of nodes or a jQuery selector which will identify the node(s).
         * @param {integer} column the column that a click on this node will sort on
         * @param {function} [callback] callback function when sort is run
         * @returns {DataTables.Api} this
         */
        _api_register('order.listener()', function (node, column, callback) {
            return this.iterator('table', function (settings) {
                _fnSortAttachListener(settings, node, column, callback);
            });
        });


        // Order by the selected column(s)
        _api_register([
            'columns().order()',
            'column().order()'
        ], function (dir) {
            var that = this;

            return this.iterator('table', function (settings, i) {
                var sort = [];

                $.each(that[i], function (j, col) {
                    sort.push([col, dir]);
                });

                settings.aaSorting = sort;
            });
        });


        _api_register('search()', function (input, regex, smart, caseInsen) {
            var ctx = this.context;

            if (input === undefined) {
                // get
                return ctx.length !== 0 ?
                    ctx[0].oPreviousSearch.sSearch :
                    undefined;
            }

            // set
            return this.iterator('table', function (settings) {
                if (!settings.oFeatures.bFilter) {
                    return;
                }

                _fnFilterComplete(settings, $.extend({}, settings.oPreviousSearch, {
                    "sSearch": input + "",
                    "bRegex": regex === null ? false : regex,
                    "bSmart": smart === null ? true : smart,
                    "bCaseInsensitive": caseInsen === null ? true : caseInsen
                }), 1);
            });
        });


        _api_register([
            'columns().search()',
            'column().search()'
        ], function (input, regex, smart, caseInsen) {
            return this.iterator('column', function (settings, column) {
                var preSearch = settings.aoPreSearchCols;

                if (input === undefined) {
                    // get
                    return preSearch[column].sSearch;
                }

                // set
                if (!settings.oFeatures.bFilter) {
                    return;
                }

                $.extend(preSearch[column], {
                    "sSearch": input + "",
                    "bRegex": regex === null ? false : regex,
                    "bSmart": smart === null ? true : smart,
                    "bCaseInsensitive": caseInsen === null ? true : caseInsen
                });

                _fnFilterComplete(settings, settings.oPreviousSearch, 1);
            });
        });


        /**
         * Provide a common method for plug-ins to check the version of DataTables being
         * used, in order to ensure compatibility.
         *
         *  @param {string} version Version string to check for, in the format "X.Y.Z".
         *    Note that the formats "X" and "X.Y" are also acceptable.
         *  @returns {boolean} true if this version of DataTables is greater or equal to
         *    the required version, or false if this version of DataTales is not
         *    suitable
         *  @static
         *  @dtopt API-Static
         *
         *  @example
         *    alert( $.fn.dataTable.versionCheck( '1.9.0' ) );
         */
        DataTable.versionCheck = DataTable.fnVersionCheck = function (version) {
            var aThis = DataTable.version.split('.');
            var aThat = version.split('.');
            var iThis, iThat;

            for (var i = 0, iLen = aThat.length; i < iLen; i++) {
                iThis = parseInt(aThis[i], 10) || 0;
                iThat = parseInt(aThat[i], 10) || 0;

                // Parts are the same, keep comparing
                if (iThis === iThat) {
                    continue;
                }

                // Parts are different, return immediately
                return iThis > iThat;
            }

            return true;
        };


        /**
         * Check if a `<table>` node is a DataTable table already or not.
         *
         *  @param {node|jquery|string} table Table node, jQuery object or jQuery
         *      selector for the table to test. Note that if more than more than one
         *      table is passed on, only the first will be checked
         *  @returns {boolean} true the table given is a DataTable, or false otherwise
         *  @static
         *  @dtopt API-Static
         *
         *  @example
         *    if ( ! $.fn.DataTable.isDataTable( '#example' ) ) {
	 *      $('#example').dataTable();
	 *    }
         */
        DataTable.isDataTable = DataTable.fnIsDataTable = function (table) {
            var t = $(table).get(0);
            var is = false;

            $.each(DataTable.settings, function (i, o) {
                if (o.nTable === t || o.nScrollHead === t || o.nScrollFoot === t) {
                    is = true;
                }
            });

            return is;
        };


        /**
         * Get all DataTable tables that have been initialised - optionally you can
         * select to get only currently visible tables.
         *
         *  @param {boolean} [visible=false] Flag to indicate if you want all (default)
         *    or visible tables only.
         *  @returns {array} Array of `table` nodes (not DataTable instances) which are
         *    DataTables
         *  @static
         *  @dtopt API-Static
         *
         *  @example
         *    $.each( $.fn.dataTable.tables(true), function () {
	 *      $(table).DataTable().columns.adjust();
	 *    } );
         */
        DataTable.tables = DataTable.fnTables = function (visible) {
            return jQuery.map(DataTable.settings, function (o) {
                if (!visible || (visible && $(o.nTable).is(':visible'))) {
                    return o.nTable;
                }
            });
        };


        /**
         * Convert from camel case parameters to Hungarian notation. This is made public
         * for the extensions to provide the same ability as DataTables core to accept
         * either the 1.9 style Hungarian notation, or the 1.10+ style camelCase
         * parameters.
         *
         *  @param {object} src The model object which holds all parameters that can be
         *    mapped.
         *  @param {object} user The object to convert from camel case to Hungarian.
         *  @param {boolean} force When set to `true`, properties which already have a
         *    Hungarian value in the `user` object will be overwritten. Otherwise they
         *    won't be.
         */
        DataTable.camelToHungarian = _fnCamelToHungarian;


        /**
         *
         */
        _api_register('$()', function (selector, opts) {
            var
                rows = this.rows(opts).nodes(), // Get all rows
                jqRows = $(rows);

            return $([].concat(
                jqRows.filter(selector).toArray(),
                jqRows.find(selector).toArray()
            ));
        });


        // jQuery functions to operate on the tables
        $.each(['on', 'one', 'off'], function (i, key) {
            _api_register(key + '()', function (/* event, handler */) {
                var args = Array.prototype.slice.call(arguments);

                // Add the `dt` namespace automatically if it isn't already present
                if (args[0].indexOf('.dt') === -1) {
                    args[0] += '.dt';
                }

                var inst = $(this.tables().nodes());
                inst[key].apply(inst, args);
                return this;
            });
        });


        _api_register('clear()', function () {
            return this.iterator('table', function (settings) {
                _fnClearTable(settings);
            });
        });


        _api_register('settings()', function () {
            return new _Api(this.context, this.context);
        });


        _api_register('data()', function () {
            return this.iterator('table', function (settings) {
                return _pluck(settings.aoData, '_aData');
            }).flatten();
        });


        _api_register('destroy()', function (remove) {
            remove = remove || false;

            return this.iterator('table', function (settings) {
                var orig = settings.nTableWrapper.parentNode;
                var classes = settings.oClasses;
                var table = settings.nTable;
                var tbody = settings.nTBody;
                var thead = settings.nTHead;
                var tfoot = settings.nTFoot;
                var jqTable = $(table);
                var jqTbody = $(tbody);
                var jqWrapper = $(settings.nTableWrapper);
                var rows = $.map(settings.aoData, function (r) {
                    return r.nTr;
                });
                var i, ien;

                // Flag to note that the table is currently being destroyed - no action
                // should be taken
                settings.bDestroying = true;

                // Fire off the destroy callbacks for plug-ins etc
                _fnCallbackFire(settings, "aoDestroyCallback", "destroy", [settings]);

                // If not being removed from the document, make all columns visible
                if (!remove) {
                    new _Api(settings).columns().visible(true);
                }

                // Blitz all DT events
                jqWrapper.unbind('.DT').find(':not(tbody *)').unbind('.DT');
                $(window).unbind('.DT-' + settings.sInstance);

                // When scrolling we had to break the table up - restore it
                if (table != thead.parentNode) {
                    jqTable.children('thead').remove();
                    jqTable.append(thead);
                }

                if (tfoot && table != tfoot.parentNode) {
                    jqTable.children('tfoot').remove();
                    jqTable.append(tfoot);
                }

                // Remove the DataTables generated nodes, events and classes
                jqTable.remove();
                jqWrapper.remove();

                settings.aaSorting = [];
                settings.aaSortingFixed = [];
                _fnSortingClasses(settings);

                $(rows).removeClass(settings.asStripeClasses.join(' '));

                $('th, td', thead).removeClass(classes.sSortable + ' ' +
                    classes.sSortableAsc + ' ' + classes.sSortableDesc + ' ' + classes.sSortableNone
                );

                if (settings.bJUI) {
                    $('th span.' + classes.sSortIcon + ', td span.' + classes.sSortIcon, thead).remove();
                    $('th, td', thead).each(function () {
                        var wrapper = $('div.' + classes.sSortJUIWrapper, this);
                        $(this).append(wrapper.contents());
                        wrapper.remove();
                    });
                }

                if (!remove) {
                    // insertBefore acts like appendChild if !arg[1]
                    orig.insertBefore(table, settings.nTableReinsertBefore);
                }

                // Add the TR elements back into the table in their original order
                jqTbody.children().detach();
                jqTbody.append(rows);

                // Restore the width of the original table - was read from the style property,
                // so we can restore directly to that
                jqTable
                    .css('width', settings.sDestroyWidth)
                    .removeClass(classes.sTable);

                // If the were originally stripe classes - then we add them back here.
                // Note this is not fool proof (for example if not all rows had stripe
                // classes - but it's a good effort without getting carried away
                ien = settings.asDestroyStripes.length;

                if (ien) {
                    jqTbody.children().each(function (i) {
                        $(this).addClass(settings.asDestroyStripes[i % ien]);
                    });
                }

                /* Remove the settings object from the settings array */
                var idx = $.inArray(settings, DataTable.settings);
                if (idx !== -1) {
                    DataTable.settings.splice(idx, 1);
                }
            });
        });


        /**
         * Version string for plug-ins to check compatibility. Allowed format is
         * `a.b.c-d` where: a:int, b:int, c:int, d:string(dev|beta|alpha). `d` is used
         * only for non-release builds. See http://semver.org/ for more information.
         *  @member
         *  @type string
         *  @default Version number
         */
        DataTable.version = "1.10.0-beta.2";

        /**
         * Private data store, containing all of the settings objects that are
         * created for the tables on a given page.
         *
         * Note that the `DataTable.settings` object is aliased to
         * `jQuery.fn.dataTableExt` through which it may be accessed and
         * manipulated, or `jQuery.fn.dataTable.settings`.
         *  @member
         *  @type array
         *  @default []
         *  @private
         */
        DataTable.settings = [];

        /**
         * Object models container, for the various models that DataTables has
         * available to it. These models define the objects that are used to hold
         * the active state and configuration of the table.
         *  @namespace
         */
        DataTable.models = {};


        /**
         * Template object for the way in which DataTables holds information about
         * search information for the global filter and individual column filters.
         *  @namespace
         */
        DataTable.models.oSearch = {
            /**
             * Flag to indicate if the filtering should be case insensitive or not
             *  @type boolean
             *  @default true
             */
            "bCaseInsensitive": true,

            /**
             * Applied search term
             *  @type string
             *  @default <i>Empty string</i>
             */
            "sSearch": "",

            /**
             * Flag to indicate if the search term should be interpreted as a
             * regular expression (true) or not (false) and therefore and special
             * regex characters escaped.
             *  @type boolean
             *  @default false
             */
            "bRegex": false,

            /**
             * Flag to indicate if DataTables is to use its smart filtering or not.
             *  @type boolean
             *  @default true
             */
            "bSmart": true
        };


        /**
         * Template object for the way in which DataTables holds information about
         * each individual row. This is the object format used for the settings
         * aoData array.
         *  @namespace
         */
        DataTable.models.oRow = {
            /**
             * TR element for the row
             *  @type node
             *  @default null
             */
            "nTr": null,

            /**
             * Array of TD elements for each row. This is null until the row has been
             * created.
             *  @type array nodes
             *  @default []
             */
            "anCells": null,

            /**
             * Data object from the original data source for the row. This is either
             * an array if using the traditional form of DataTables, or an object if
             * using mData options. The exact type will depend on the passed in
             * data from the data source, or will be an array if using DOM a data
             * source.
             *  @type array|object
             *  @default []
             */
            "_aData": [],

            /**
             * Sorting data cache - this array is ostensibly the same length as the
             * number of columns (although each index is generated only as it is
             * needed), and holds the data that is used for sorting each column in the
             * row. We do this cache generation at the start of the sort in order that
             * the formatting of the sort data need be done only once for each cell
             * per sort. This array should not be read from or written to by anything
             * other than the master sorting methods.
             *  @type array
             *  @default null
             *  @private
             */
            "_aSortData": null,

            /**
             * Per cell filtering data cache. As per the sort data cache, used to
             * increase the performance of the filtering in DataTables
             *  @type array
             *  @default null
             *  @private
             */
            "_aFilterData": null,

            /**
             * Filtering data cache. This is the same as the cell filtering cache, but
             * in this case a string rather than an array. This is easily computed with
             * a join on `_aFilterData`, but is provided as a cache so the join isn't
             * needed on every search (memory traded for performance)
             *  @type array
             *  @default null
             *  @private
             */
            "_sFilterRow": null,

            /**
             * Cache of the class name that DataTables has applied to the row, so we
             * can quickly look at this variable rather than needing to do a DOM check
             * on className for the nTr property.
             *  @type string
             *  @default <i>Empty string</i>
             *  @private
             */
            "_sRowStripe": "",

            /**
             * Denote if the original data source was from the DOM, or the data source
             * object. This is used for invalidating data, so DataTables can
             * automatically read data from the original source, unless uninstructed
             * otherwise.
             *  @type string
             *  @default null
             *  @private
             */
            "src": null
        };


        /**
         * Template object for the column information object in DataTables. This object
         * is held in the settings aoColumns array and contains all the information that
         * DataTables needs about each individual column.
         *
         * Note that this object is related to {@link DataTable.defaults.column}
         * but this one is the internal data store for DataTables's cache of columns.
         * It should NOT be manipulated outside of DataTables. Any configuration should
         * be done through the initialisation options.
         *  @namespace
         */
        DataTable.models.oColumn = {
            /**
             * Column index. This could be worked out on-the-fly with $.inArray, but it
             * is faster to just hold it as a variable
             *  @type integer
             *  @default null
             */
            "idx": null,

            /**
             * A list of the columns that sorting should occur on when this column
             * is sorted. That this property is an array allows multi-column sorting
             * to be defined for a column (for example first name / last name columns
             * would benefit from this). The values are integers pointing to the
             * columns to be sorted on (typically it will be a single integer pointing
             * at itself, but that doesn't need to be the case).
             *  @type array
             */
            "aDataSort": null,

            /**
             * Define the sorting directions that are applied to the column, in sequence
             * as the column is repeatedly sorted upon - i.e. the first value is used
             * as the sorting direction when the column if first sorted (clicked on).
             * Sort it again (click again) and it will move on to the next index.
             * Repeat until loop.
             *  @type array
             */
            "asSorting": null,

            /**
             * Flag to indicate if the column is searchable, and thus should be included
             * in the filtering or not.
             *  @type boolean
             */
            "bSearchable": null,

            /**
             * Flag to indicate if the column is sortable or not.
             *  @type boolean
             */
            "bSortable": null,

            /**
             * Flag to indicate if the column is currently visible in the table or not
             *  @type boolean
             */
            "bVisible": null,

            /**
             * Store for manual type assignment using the `column.type` option. This
             * is held in store so we can manipulate the column's `sType` property.
             *  @type string
             *  @default null
             *  @private
             */
            "_sManualType": null,

            /**
             * Flag to indicate if HTML5 data attributes should be used as the data
             * source for filtering or sorting. True is either are.
             *  @type boolean
             *  @default false
             *  @private
             */
            "_bAttrSrc": false,

            /**
             * Developer definable function that is called whenever a cell is created (Ajax source,
             * etc) or processed for input (DOM source). This can be used as a compliment to mRender
             * allowing you to modify the DOM element (add background colour for example) when the
             * element is available.
             *  @type function
             *  @param {element} nTd The TD node that has been created
             *  @param {*} sData The Data for the cell
             *  @param {array|object} oData The data for the whole row
             *  @param {int} iRow The row index for the aoData data store
             *  @default null
             */
            "fnCreatedCell": null,

            /**
             * Function to get data from a cell in a column. You should <b>never</b>
             * access data directly through _aData internally in DataTables - always use
             * the method attached to this property. It allows mData to function as
             * required. This function is automatically assigned by the column
             * initialisation method
             *  @type function
             *  @param {array|object} oData The data array/object for the array
             *    (i.e. aoData[]._aData)
             *  @param {string} sSpecific The specific data type you want to get -
             *    'display', 'type' 'filter' 'sort'
             *  @returns {*} The data for the cell from the given row's data
             *  @default null
             */
            "fnGetData": null,

            /**
             * Function to set data for a cell in the column. You should <b>never</b>
             * set the data directly to _aData internally in DataTables - always use
             * this method. It allows mData to function as required. This function
             * is automatically assigned by the column initialisation method
             *  @type function
             *  @param {array|object} oData The data array/object for the array
             *    (i.e. aoData[]._aData)
             *  @param {*} sValue Value to set
             *  @default null
             */
            "fnSetData": null,

            /**
             * Property to read the value for the cells in the column from the data
             * source array / object. If null, then the default content is used, if a
             * function is given then the return from the function is used.
             *  @type function|int|string|null
             *  @default null
             */
            "mData": null,

            /**
             * Partner property to mData which is used (only when defined) to get
             * the data - i.e. it is basically the same as mData, but without the
             * 'set' option, and also the data fed to it is the result from mData.
             * This is the rendering method to match the data method of mData.
             *  @type function|int|string|null
             *  @default null
             */
            "mRender": null,

            /**
             * Unique header TH/TD element for this column - this is what the sorting
             * listener is attached to (if sorting is enabled.)
             *  @type node
             *  @default null
             */
            "nTh": null,

            /**
             * Unique footer TH/TD element for this column (if there is one). Not used
             * in DataTables as such, but can be used for plug-ins to reference the
             * footer for each column.
             *  @type node
             *  @default null
             */
            "nTf": null,

            /**
             * The class to apply to all TD elements in the table's TBODY for the column
             *  @type string
             *  @default null
             */
            "sClass": null,

            /**
             * When DataTables calculates the column widths to assign to each column,
             * it finds the longest string in each column and then constructs a
             * temporary table and reads the widths from that. The problem with this
             * is that "mmm" is much wider then "iiii", but the latter is a longer
             * string - thus the calculation can go wrong (doing it properly and putting
             * it into an DOM object and measuring that is horribly(!) slow). Thus as
             * a "work around" we provide this option. It will append its value to the
             * text that is found to be the longest string for the column - i.e. padding.
             *  @type string
             */
            "sContentPadding": null,

            /**
             * Allows a default value to be given for a column's data, and will be used
             * whenever a null data source is encountered (this can be because mData
             * is set to null, or because the data source itself is null).
             *  @type string
             *  @default null
             */
            "sDefaultContent": null,

            /**
             * Name for the column, allowing reference to the column by name as well as
             * by index (needs a lookup to work by name).
             *  @type string
             */
            "sName": null,

            /**
             * Custom sorting data type - defines which of the available plug-ins in
             * afnSortData the custom sorting will use - if any is defined.
             *  @type string
             *  @default std
             */
            "sSortDataType": 'std',

            /**
             * Class to be applied to the header element when sorting on this column
             *  @type string
             *  @default null
             */
            "sSortingClass": null,

            /**
             * Class to be applied to the header element when sorting on this column -
             * when jQuery UI theming is used.
             *  @type string
             *  @default null
             */
            "sSortingClassJUI": null,

            /**
             * Title of the column - what is seen in the TH element (nTh).
             *  @type string
             */
            "sTitle": null,

            /**
             * Column sorting and filtering type
             *  @type string
             *  @default null
             */
            "sType": null,

            /**
             * Width of the column
             *  @type string
             *  @default null
             */
            "sWidth": null,

            /**
             * Width of the column when it was first "encountered"
             *  @type string
             *  @default null
             */
            "sWidthOrig": null
        };


        /*
	 * Developer note: The properties of the object below are given in Hungarian
	 * notation, that was used as the interface for DataTables prior to v1.10, however
	 * from v1.10 onwards the primary interface is camel case. In order to avoid
	 * breaking backwards compatibility utterly with this change, the Hungarian
	 * version is still, internally the primary interface, but is is not documented
	 * - hence the @name tags in each doc comment. This allows a Javascript function
	 * to create a map from Hungarian notation to camel case (going the other direction
	 * would require each property to be listed, which would at around 3K to the size
	 * of DataTables, while this method is about a 0.5K hit.
	 *
	 * Ultimately this does pave the way for Hungarian notation to be dropped
	 * completely, but that is a massive amount of work and will break current
	 * installs (therefore is on-hold until v2).
	 */

        /**
         * Initialisation options that can be given to DataTables at initialisation
         * time.
         *  @namespace
         */
        DataTable.defaults = {
            /**
             * An array of data to use for the table, passed in at initialisation which
             * will be used in preference to any data which is already in the DOM. This is
             * particularly useful for constructing tables purely in Javascript, for
             * example with a custom Ajax call.
             *  @type array
             *  @default null
             *
             *  @dtopt Option
             *  @name DataTable.defaults.data
             *
             *  @example
             *    // Using a 2D array data source
             *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "data": [
		 *          ['Trident', 'Internet Explorer 4.0', 'Win 95+', 4, 'X'],
		 *          ['Trident', 'Internet Explorer 5.0', 'Win 95+', 5, 'C'],
		 *        ],
		 *        "columns": [
		 *          { "title": "Engine" },
		 *          { "title": "Browser" },
		 *          { "title": "Platform" },
		 *          { "title": "Version" },
		 *          { "title": "Grade" }
		 *        ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Using an array of objects as a data source (`data`)
             *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "data": [
		 *          {
		 *            "engine":   "Trident",
		 *            "browser":  "Internet Explorer 4.0",
		 *            "platform": "Win 95+",
		 *            "version":  4,
		 *            "grade":    "X"
		 *          },
		 *          {
		 *            "engine":   "Trident",
		 *            "browser":  "Internet Explorer 5.0",
		 *            "platform": "Win 95+",
		 *            "version":  5,
		 *            "grade":    "C"
		 *          }
		 *        ],
		 *        "columns": [
		 *          { "title": "Engine",   "data": "engine" },
		 *          { "title": "Browser",  "data": "browser" },
		 *          { "title": "Platform", "data": "platform" },
		 *          { "title": "Version",  "data": "version" },
		 *          { "title": "Grade",    "data": "grade" }
		 *        ]
		 *      } );
		 *    } );
             */
            "aaData": null,


            /**
             * If ordering is enabled, then DataTables will perform a first pass sort on
             * initialisation. You can define which column(s) the sort is performed
             * upon, and the sorting direction, with this variable. The `sorting` array
             * should contain an array for each column to be sorted initially containing
             * the column's index and a direction string ('asc' or 'desc').
             *  @type array
             *  @default [[0,'asc']]
             *
             *  @dtopt Option
             *  @name DataTable.defaults.order
             *
             *  @example
             *    // Sort by 3rd column first, and then 4th column
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "order": [[2,'asc'], [3,'desc']]
		 *      } );
		 *    } );
             *
             *    // No initial sorting
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "order": []
		 *      } );
		 *    } );
             */
            "aaSorting": [[0, 'asc']],


            /**
             * This parameter is basically identical to the `sorting` parameter, but
             * cannot be overridden by user interaction with the table. What this means
             * is that you could have a column (visible or hidden) which the sorting
             * will always be forced on first - any sorting after that (from the user)
             * will then be performed as required. This can be useful for grouping rows
             * together.
             *  @type array
             *  @default null
             *
             *  @dtopt Option
             *  @name DataTable.defaults.orderFixed
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "orderFixed": [[0,'asc']]
		 *      } );
		 *    } )
             */
            "aaSortingFixed": [],


            /**
             * DataTables can be instructed to load data to display in the table from a
             * Ajax source. This option defines how that Ajax call is made and where to.
             *
             * The `ajax` property has three different modes of operation, depending on
             * how it is defined. These are:
             *
             * * `string` - Set the URL from where the data should be loaded from.
             * * `object` - Define properties for `jQuery.ajax`.
             * * `function` - Custom data get function
             *
             * `string`
             * --------
             *
             * As a string, the `ajax` property simply defines the URL from which
             * DataTables will load data.
             *
             * `object`
             * --------
             *
             * As an object, the parameters in the object are passed to
             * [jQuery.ajax](http://api.jquery.com/jQuery.ajax/) allowing fine control
             * of the Ajax request. DataTables has a number of default parameters which
             * you can override using this option. Please refer to the jQuery
             * documentation for a full description of the options available, although
             * the following parameters provide additional options in DataTables or
             * require special consideration:
             *
             * * `data` - As with jQuery, `data` can be provided as an object, but it
             *   can also be used as a function to manipulate the data DataTables sends
             *   to the server. The function takes a single parameter, an object of
             *   parameters with the values that DataTables has readied for sending. An
             *   object may be returned which will be merged into the DataTables
             *   defaults, or you can add the items to the object that was passed in and
             *   not return anything from the function. This supersedes `fnServerParams`
             *   from DataTables 1.9-.
             *
             * * `dataSrc` - By default DataTables will look for the property `data` (or
             *   `aaData` for compatibility with DataTables 1.9-) when obtaining data
             *   from an Ajax source or for server-side processing - this parameter
             *   allows that property to be changed. You can use Javascript dotted
             *   object notation to get a data source for multiple levels of nesting, or
             *   it my be used as a function. As a function it takes a single parameter,
             *   the JSON returned from the server, which can be manipulated as
             *   required, with the returned value being that used by DataTables as the
             *   data source for the table. This supersedes `sAjaxDataProp` from
             *   DataTables 1.9-.
             *
             * * `success` - Should not be overridden it is used internally in
             *   DataTables. To manipulate / transform the data returned by the server
             *   use `ajax.dataSrc`, or use `ajax` as a function (see below).
             *
             * `function`
             * ----------
             *
             * As a function, making the Ajax call is left up to yourself allowing
             * complete control of the Ajax request. Indeed, if desired, a method other
             * than Ajax could be used to obtain the required data, such as Web storage
             * or an AIR database.
             *
             * The function is given four parameters and no return is required. The
             * parameters are:
             *
             * 1. _object_ - Data to send to the server
             * 2. _function_ - Callback function that must be executed when the required
             *    data has been obtained. That data should be passed into the callback
             *    as the only parameter
             * 3. _object_ - DataTables settings object for the table
             *
             * Note that this supersedes `fnServerData` from DataTables 1.9-.
             *
             *  @type string|object|function
             *  @default null
             *
             *  @dtopt Option
             *  @name DataTable.defaults.ajax
             *  @since 1.10.0
             *
             * @example
             *   // Get JSON data from a file via Ajax.
             *   // Note DataTables expects data in the form `{ data: [ ...data... ] }` by default).
             *   $('#example').dataTable( {
		 *     "ajax": "data.json"
		 *   } );
             *
             * @example
             *   // Get JSON data from a file via Ajax, using `dataSrc` to change
             *   // `data` to `tableData` (i.e. `{ tableData: [ ...data... ] }`)
             *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "dataSrc": "tableData"
		 *     }
		 *   } );
             *
             * @example
             *   // Get JSON data from a file via Ajax, using `dataSrc` to read data
             *   // from a plain array rather than an array in an object
             *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "dataSrc": ""
		 *     }
		 *   } );
             *
             * @example
             *   // Manipulate the data returned from the server - add a link to data
             *   // (note this can, should, be done using `render` for the column - this
             *   // is just a simple example of how the data can be manipulated).
             *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "dataSrc": function ( json ) {
		 *         for ( var i=0, ien=json.length ; i<ien ; i++ ) {
		 *           json[i][0] = '<a href="/message/'+json[i][0]+'>View message</a>';
		 *         }
		 *         return json;
		 *       }
		 *     }
		 *   } );
             *
             * @example
             *   // Add data to the request
             *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "data": function ( d ) {
		 *         return {
		 *           "extra_search": $('#extra').val()
		 *         };
		 *       }
		 *     }
		 *   } );
             *
             * @example
             *   // Send request as POST
             *   $('#example').dataTable( {
		 *     "ajax": {
		 *       "url": "data.json",
		 *       "type": "POST"
		 *     }
		 *   } );
             *
             * @example
             *   // Get the data from localStorage (could interface with a form for
             *   // adding, editing and removing rows).
             *   $('#example').dataTable( {
		 *     "ajax": function (data, callback, settings) {
		 *       callback(
		 *         JSON.parse( localStorage.getItem('dataTablesData') )
		 *       );
		 *     }
		 *   } );
             */
            "ajax": null,


            /**
             * This parameter allows you to readily specify the entries in the length drop
             * down menu that DataTables shows when pagination is enabled. It can be
             * either a 1D array of options which will be used for both the displayed
             * option and the value, or a 2D array which will use the array in the first
             * position as the value, and the array in the second position as the
             * displayed options (useful for language strings such as 'All').
             *
             * Note that the `pageLength` property will be automatically set to the
             * first value given in this array, unless `pageLength` is also provided.
             *  @type array
             *  @default [ 10, 25, 50, 100 ]
             *
             *  @dtopt Option
             *  @name DataTable.defaults.lengthMenu
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
		 *      } );
		 *    } );
             */
            "aLengthMenu": [10, 25, 50, 100],


            /**
             * The `columns` option in the initialisation parameter allows you to define
             * details about the way individual columns behave. For a full list of
             * column options that can be set, please see
             * {@link DataTable.defaults.column}. Note that if you use `columns` to
             * define your columns, you must have an entry in the array for every single
             * column that you have in your table (these can be null if you don't which
             * to specify any options).
             *  @member
             *
             *  @name DataTable.defaults.column
             */
            "aoColumns": null,

            /**
             * Very similar to `columns`, `columnDefs` allows you to target a specific
             * column, multiple columns, or all columns, using the `targets` property of
             * each object in the array. This allows great flexibility when creating
             * tables, as the `columnDefs` arrays can be of any length, targeting the
             * columns you specifically want. `columnDefs` may use any of the column
             * options available: {@link DataTable.defaults.column}, but it _must_
             * have `targets` defined in each object in the array. Values in the `targets`
             * array may be:
             *   <ul>
             *     <li>a string - class name will be matched on the TH for the column</li>
             *     <li>0 or a positive integer - column index counting from the left</li>
             *     <li>a negative integer - column index counting from the right</li>
             *     <li>the string "_all" - all columns (i.e. assign a default)</li>
             *   </ul>
             *  @member
             *
             *  @name DataTable.defaults.columnDefs
             */
            "aoColumnDefs": null,


            /**
             * Basically the same as `search`, this parameter defines the individual column
             * filtering state at initialisation time. The array must be of the same size
             * as the number of columns, and each element be an object with the parameters
             * `search` and `escapeRegex` (the latter is optional). 'null' is also
             * accepted and the default will be used.
             *  @type array
             *  @default []
             *
             *  @dtopt Option
             *  @name DataTable.defaults.searchCols
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "searchCols": [
		 *          null,
		 *          { "search": "My filter" },
		 *          null,
		 *          { "search": "^[0-9]", "escapeRegex": false }
		 *        ]
		 *      } );
		 *    } )
             */
            "aoSearchCols": [],


            /**
             * An array of CSS classes that should be applied to displayed rows. This
             * array may be of any length, and DataTables will apply each class
             * sequentially, looping when required.
             *  @type array
             *  @default null <i>Will take the values determined by the `oClasses.stripe*`
             *    options</i>
             *
             *  @dtopt Option
             *  @name DataTable.defaults.stripeClasses
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stripeClasses": [ 'strip1', 'strip2', 'strip3' ]
		 *      } );
		 *    } )
             */
            "asStripeClasses": null,


            /**
             * Enable or disable automatic column width calculation. This can be disabled
             * as an optimisation (it takes some time to calculate the widths) if the
             * tables widths are passed in using `columns`.
             *  @type boolean
             *  @default true
             *
             *  @dtopt Features
             *  @name DataTable.defaults.autoWidth
             *
             *  @example
             *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "autoWidth": false
		 *      } );
		 *    } );
             */
            "bAutoWidth": true,


            /**
             * Deferred rendering can provide DataTables with a huge speed boost when you
             * are using an Ajax or JS data source for the table. This option, when set to
             * true, will cause DataTables to defer the creation of the table elements for
             * each row until they are needed for a draw - saving a significant amount of
             * time.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Features
             *  @name DataTable.defaults.deferRender
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "ajax": "sources/arrays.txt",
		 *        "deferRender": true
		 *      } );
		 *    } );
             */
            "bDeferRender": false,


            /**
             * Replace a DataTable which matches the given selector and replace it with
             * one which has the properties of the new initialisation object passed. If no
             * table matches the selector, then the new DataTable will be constructed as
             * per normal.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Options
             *  @name DataTable.defaults.destroy
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "srollY": "200px",
		 *        "paginate": false
		 *      } );
		 *
		 *      // Some time later....
		 *      $('#example').dataTable( {
		 *        "filter": false,
		 *        "destroy": true
		 *      } );
		 *    } );
             */
            "bDestroy": false,


            /**
             * Enable or disable filtering of data. Filtering in DataTables is "smart" in
             * that it allows the end user to input multiple words (space separated) and
             * will match a row containing those words, even if not in the order that was
             * specified (this allow matching across multiple columns). Note that if you
             * wish to use filtering in DataTables this must remain 'true' - to remove the
             * default filtering input box and retain filtering abilities, please use
             * {@link DataTable.defaults.dom}.
             *  @type boolean
             *  @default true
             *
             *  @dtopt Features
             *  @name DataTable.defaults.searching
             *
             *  @example
             *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "searching": false
		 *      } );
		 *    } );
             */
            "bFilter": true,


            /**
             * Enable or disable the table information display. This shows information
             * about the data that is currently visible on the page, including information
             * about filtered data if that action is being performed.
             *  @type boolean
             *  @default true
             *
             *  @dtopt Features
             *  @name DataTable.defaults.info
             *
             *  @example
             *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "info": false
		 *      } );
		 *    } );
             */
            "bInfo": true,


            /**
             * Enable jQuery UI ThemeRoller support (required as ThemeRoller requires some
             * slightly different and additional mark-up from what DataTables has
             * traditionally used).
             *  @type boolean
             *  @default false
             *
             *  @dtopt Features
             *  @name DataTable.defaults.jQueryUI
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "jQueryUI": true
		 *      } );
		 *    } );
             */
            "bJQueryUI": false,


            /**
             * Allows the end user to select the size of a formatted page from a select
             * menu (sizes are 10, 25, 50 and 100). Requires pagination (`paginate`).
             *  @type boolean
             *  @default true
             *
             *  @dtopt Features
             *  @name DataTable.defaults.lengthChange
             *
             *  @example
             *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "lengthChange": false
		 *      } );
		 *    } );
             */
            "bLengthChange": true,


            /**
             * Enable or disable pagination.
             *  @type boolean
             *  @default true
             *
             *  @dtopt Features
             *  @name DataTable.defaults.paging
             *
             *  @example
             *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "paging": false
		 *      } );
		 *    } );
             */
            "bPaginate": true,


            /**
             * Enable or disable the display of a 'processing' indicator when the table is
             * being processed (e.g. a sort). This is particularly useful for tables with
             * large amounts of data where it can take a noticeable amount of time to sort
             * the entries.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Features
             *  @name DataTable.defaults.processing
             *
             *  @example
             *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "processing": true
		 *      } );
		 *    } );
             */
            "bProcessing": false,


            /**
             * Retrieve the DataTables object for the given selector. Note that if the
             * table has already been initialised, this parameter will cause DataTables
             * to simply return the object that has already been set up - it will not take
             * account of any changes you might have made to the initialisation object
             * passed to DataTables (setting this parameter to true is an acknowledgement
             * that you understand this). `destroy` can be used to reinitialise a table if
             * you need.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Options
             *  @name DataTable.defaults.retrieve
             *
             *  @example
             *    $(document).ready( function() {
		 *      initTable();
		 *      tableActions();
		 *    } );
             *
             *    function initTable ()
             *    {
		 *      return $('#example').dataTable( {
		 *        "scrollY": "200px",
		 *        "paginate": false,
		 *        "retrieve": true
		 *      } );
		 *    }
             *
             *    function tableActions ()
             *    {
		 *      var table = initTable();
		 *      // perform API operations with oTable
		 *    }
             */
            "bRetrieve": false,


            /**
             * When vertical (y) scrolling is enabled, DataTables will force the height of
             * the table's viewport to the given height at all times (useful for layout).
             * However, this can look odd when filtering data down to a small data set,
             * and the footer is left "floating" further down. This parameter (when
             * enabled) will cause DataTables to collapse the table's viewport down when
             * the result set will fit within the given Y height.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Options
             *  @name DataTable.defaults.scrollCollapse
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "scrollY": "200",
		 *        "scrollCollapse": true
		 *      } );
		 *    } );
             */
            "bScrollCollapse": false,


            /**
             * Configure DataTables to use server-side processing. Note that the
             * `ajax` parameter must also be given in order to give DataTables a
             * source to obtain the required data for each draw.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Features
             *  @dtopt Server-side
             *  @name DataTable.defaults.serverSide
             *
             *  @example
             *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "serverSide": true,
		 *        "ajax": "xhr.php"
		 *      } );
		 *    } );
             */
            "bServerSide": false,


            /**
             * Enable or disable sorting of columns. Sorting of individual columns can be
             * disabled by the `sortable` option for each column.
             *  @type boolean
             *  @default true
             *
             *  @dtopt Features
             *  @name DataTable.defaults.ordering
             *
             *  @example
             *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "ordering": false
		 *      } );
		 *    } );
             */
            "bSort": true,


            /**
             * Enable or display DataTables' ability to sort multiple columns at the
             * same time (activated by shift-click by the user).
             *  @type boolean
             *  @default true
             *
             *  @dtopt Options
             *  @name DataTable.defaults.orderMulti
             *
             *  @example
             *    // Disable multiple column sorting ability
             *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "orderMulti": false
		 *      } );
		 *    } );
             */
            "bSortMulti": true,


            /**
             * Allows control over whether DataTables should use the top (true) unique
             * cell that is found for a single column, or the bottom (false - default).
             * This is useful when using complex headers.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Options
             *  @name DataTable.defaults.orderCellsTop
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "orderCellsTop": true
		 *      } );
		 *    } );
             */
            "bSortCellsTop": false,


            /**
             * Enable or disable the addition of the classes `sorting\_1`, `sorting\_2` and
             * `sorting\_3` to the columns which are currently being sorted on. This is
             * presented as a feature switch as it can increase processing time (while
             * classes are removed and added) so for large data sets you might want to
             * turn this off.
             *  @type boolean
             *  @default true
             *
             *  @dtopt Features
             *  @name DataTable.defaults.orderClasses
             *
             *  @example
             *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "orderClasses": false
		 *      } );
		 *    } );
             */
            "bSortClasses": true,


            /**
             * Enable or disable state saving. When enabled HTML5 `localStorage` will be
             * used to save table display information such as pagination information,
             * display length, filtering and sorting. As such when the end user reloads
             * the page the display display will match what thy had previously set up.
             *
             * Due to the use of `localStorage` the default state saving is not supported
             * in IE6 or 7. If state saving is required in those browsers, use
             * `stateSaveCallback` to provide a storage solution such as cookies.
             *  @type boolean
             *  @default false
             *
             *  @dtopt Features
             *  @name DataTable.defaults.stateSave
             *
             *  @example
             *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "stateSave": true
		 *      } );
		 *    } );
             */
            "bStateSave": false,


            /**
             * This function is called when a TR element is created (and all TD child
             * elements have been inserted), or registered if using a DOM source, allowing
             * manipulation of the TR element (adding classes etc).
             *  @type function
             *  @param {node} row "TR" element for the current row
             *  @param {array} data Raw data array for this row
             *  @param {int} dataIndex The index of this row in the internal aoData array
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.createdRow
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "createdRow": function( row, data, dataIndex ) {
		 *          // Bold the grade for all 'A' grade browsers
		 *          if ( data[4] == "A" )
		 *          {
		 *            $('td:eq(4)', row).html( '<b>A</b>' );
		 *          }
		 *        }
		 *      } );
		 *    } );
             */
            "fnCreatedRow": null,


            /**
             * This function is called on every 'draw' event, and allows you to
             * dynamically modify any aspect you want about the created DOM.
             *  @type function
             *  @param {object} settings DataTables settings object
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.drawCallback
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "drawCallback": function( settings ) {
		 *          alert( 'DataTables has redrawn the table' );
		 *        }
		 *      } );
		 *    } );
             */
            "fnDrawCallback": null,


            /**
             * Identical to fnHeaderCallback() but for the table footer this function
             * allows you to modify the table footer on every 'draw' event.
             *  @type function
             *  @param {node} foot "TR" element for the footer
             *  @param {array} data Full table data (as derived from the original HTML)
             *  @param {int} start Index for the current display starting point in the
             *    display array
             *  @param {int} end Index for the current display ending point in the
             *    display array
             *  @param {array int} display Index array to translate the visual position
             *    to the full data array
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.footerCallback
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "footerCallback": function( tfoot, data, start, end, display ) {
		 *          tfoot.getElementsByTagName('th')[0].innerHTML = "Starting index is "+start;
		 *        }
		 *      } );
		 *    } )
             */
            "fnFooterCallback": null,


            /**
             * When rendering large numbers in the information element for the table
             * (i.e. "Showing 1 to 10 of 57 entries") DataTables will render large numbers
             * to have a comma separator for the 'thousands' units (e.g. 1 million is
             * rendered as "1,000,000") to help readability for the end user. This
             * function will override the default method DataTables uses.
             *  @type function
             *  @member
             *  @param {int} toFormat number to be formatted
             *  @returns {string} formatted string for DataTables to show the number
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.formatNumber
             *
             *  @example
             *    // Format a number using a single quote for the separator (note that
             *    // this can also be done with the language.thousands option)
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "formatNumber": function ( toFormat ) {
		 *          return toFormat.toString().replace(
		 *            /\B(?=(\d{3})+(?!\d))/g, "'"
		 *          );
		 *        };
		 *      } );
		 *    } );
             */
            "fnFormatNumber": function (toFormat) {
                return toFormat.toString().replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    this.oLanguage.sThousands
                );
            },


            /**
             * This function is called on every 'draw' event, and allows you to
             * dynamically modify the header row. This can be used to calculate and
             * display useful information about the table.
             *  @type function
             *  @param {node} head "TR" element for the header
             *  @param {array} data Full table data (as derived from the original HTML)
             *  @param {int} start Index for the current display starting point in the
             *    display array
             *  @param {int} end Index for the current display ending point in the
             *    display array
             *  @param {array int} display Index array to translate the visual position
             *    to the full data array
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.headerCallback
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fheaderCallback": function( head, data, start, end, display ) {
		 *          head.getElementsByTagName('th')[0].innerHTML = "Displaying "+(end-start)+" records";
		 *        }
		 *      } );
		 *    } )
             */
            "fnHeaderCallback": null,


            /**
             * The information element can be used to convey information about the current
             * state of the table. Although the internationalisation options presented by
             * DataTables are quite capable of dealing with most customisations, there may
             * be times where you wish to customise the string further. This callback
             * allows you to do exactly that.
             *  @type function
             *  @param {object} oSettings DataTables settings object
             *  @param {int} start Starting position in data for the draw
             *  @param {int} end End position in data for the draw
             *  @param {int} max Total number of rows in the table (regardless of
             *    filtering)
             *  @param {int} total Total number of rows in the data set, after filtering
             *  @param {string} pre The string that DataTables has formatted using it's
             *    own rules
             *  @returns {string} The string to be displayed in the information element.
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.infoCallback
             *
             *  @example
             *    $('#example').dataTable( {
		 *      "infoCallback": function( settings, start, end, max, total, pre ) {
		 *        return start +" to "+ end;
		 *      }
		 *    } );
             */
            "fnInfoCallback": null,


            /**
             * Called when the table has been initialised. Normally DataTables will
             * initialise sequentially and there will be no need for this function,
             * however, this does not hold true when using external language information
             * since that is obtained using an async XHR call.
             *  @type function
             *  @param {object} settings DataTables settings object
             *  @param {object} json The JSON object request from the server - only
             *    present if client-side Ajax sourced data is used
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.initComplete
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "initComplete": function(settings, json) {
		 *          alert( 'DataTables has finished its initialisation.' );
		 *        }
		 *      } );
		 *    } )
             */
            "fnInitComplete": null,


            /**
             * Called at the very start of each table draw and can be used to cancel the
             * draw by returning false, any other return (including undefined) results in
             * the full draw occurring).
             *  @type function
             *  @param {object} settings DataTables settings object
             *  @returns {boolean} False will cancel the draw, anything else (including no
             *    return) will allow it to complete.
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.preDrawCallback
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "preDrawCallback": function( settings ) {
		 *          if ( $('#test').val() == 1 ) {
		 *            return false;
		 *          }
		 *        }
		 *      } );
		 *    } );
             */
            "fnPreDrawCallback": null,


            /**
             * This function allows you to 'post process' each row after it have been
             * generated for each table draw, but before it is rendered on screen. This
             * function might be used for setting the row class name etc.
             *  @type function
             *  @param {node} row "TR" element for the current row
             *  @param {array} data Raw data array for this row
             *  @param {int} displayIndex The display index for the current table draw
             *  @param {int} displayIndexFull The index of the data in the full list of
             *    rows (after filtering)
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.rowCallback
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "rowCallback": function( row, data, displayIndex, displayIndexFull ) {
		 *          // Bold the grade for all 'A' grade browsers
		 *          if ( data[4] == "A" ) {
		 *            $('td:eq(4)', row).html( '<b>A</b>' );
		 *          }
		 *        }
		 *      } );
		 *    } );
             */
            "fnRowCallback": null,


            /**
             * __Deprecated__ The functionality provided by this parameter has now been
             * superseded by that provided through `ajax`, which should be used instead.
             *
             * This parameter allows you to override the default function which obtains
             * the data from the server so something more suitable for your application.
             * For example you could use POST data, or pull information from a Gears or
             * AIR database.
             *  @type function
             *  @member
             *  @param {string} source HTTP source to obtain the data from (`ajax`)
             *  @param {array} data A key/value pair object containing the data to send
             *    to the server
             *  @param {function} callback to be called on completion of the data get
             *    process that will draw the data on the page.
             *  @param {object} settings DataTables settings object
             *
             *  @dtopt Callbacks
             *  @dtopt Server-side
             *  @name DataTable.defaults.serverData
             *
             *  @deprecated 1.10. Please use `ajax` for this functionality now.
             */
            "fnServerData": null,


            /**
             * __Deprecated__ The functionality provided by this parameter has now been
             * superseded by that provided through `ajax`, which should be used instead.
             *
             *  It is often useful to send extra data to the server when making an Ajax
             * request - for example custom filtering information, and this callback
             * function makes it trivial to send extra information to the server. The
             * passed in parameter is the data set that has been constructed by
             * DataTables, and you can add to this or modify it as you require.
             *  @type function
             *  @param {array} data Data array (array of objects which are name/value
             *    pairs) that has been constructed by DataTables and will be sent to the
             *    server. In the case of Ajax sourced data with server-side processing
             *    this will be an empty array, for server-side processing there will be a
             *    significant number of parameters!
             *  @returns {undefined} Ensure that you modify the data array passed in,
             *    as this is passed by reference.
             *
             *  @dtopt Callbacks
             *  @dtopt Server-side
             *  @name DataTable.defaults.serverParams
             *
             *  @deprecated 1.10. Please use `ajax` for this functionality now.
             */
            "fnServerParams": null,


            /**
             * Load the table state. With this function you can define from where, and how, the
             * state of a table is loaded. By default DataTables will load from `localStorage`
             * but you might wish to use a server-side database or cookies.
             *  @type function
             *  @member
             *  @param {object} settings DataTables settings object
             *  @return {object} The DataTables state object to be loaded
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.stateLoadCallback
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateSave": true,
		 *        "stateLoadCallback": function (settings) {
		 *          var o;
		 *
		 *          // Send an Ajax request to the server to get the data. Note that
		 *          // this is a synchronous request.
		 *          $.ajax( {
		 *            "url": "/state_load",
		 *            "async": false,
		 *            "dataType": "json",
		 *            "success": function (json) {
		 *              o = json;
		 *            }
		 *          } );
		 *
		 *          return o;
		 *        }
		 *      } );
		 *    } );
             */
            "fnStateLoadCallback": function (settings) {
                try {
                    return JSON.parse(
                        localStorage.getItem('DataTables_' + settings.sInstance + '_' + window.location.pathname)
                    );
                } catch (e) {
                }
            },


            /**
             * Callback which allows modification of the saved state prior to loading that state.
             * This callback is called when the table is loading state from the stored data, but
             * prior to the settings object being modified by the saved state. Note that for
             * plug-in authors, you should use the `stateLoadParams` event to load parameters for
             * a plug-in.
             *  @type function
             *  @param {object} settings DataTables settings object
             *  @param {object} data The state object that is to be loaded
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.stateLoadParams
             *
             *  @example
             *    // Remove a saved filter, so filtering is never loaded
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateSave": true,
		 *        "stateLoadParams": function (settings, data) {
		 *          data.oSearch.sSearch = "";
		 *        }
		 *      } );
		 *    } );
             *
             *  @example
             *    // Disallow state loading by returning false
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateSave": true,
		 *        "stateLoadParams": function (settings, data) {
		 *          return false;
		 *        }
		 *      } );
		 *    } );
             */
            "fnStateLoadParams": null,


            /**
             * Callback that is called when the state has been loaded from the state saving method
             * and the DataTables settings object has been modified as a result of the loaded state.
             *  @type function
             *  @param {object} settings DataTables settings object
             *  @param {object} data The state object that was loaded
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.stateLoaded
             *
             *  @example
             *    // Show an alert with the filtering value that was saved
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateSave": true,
		 *        "stateLoaded": function (settings, data) {
		 *          alert( 'Saved filter was: '+data.oSearch.sSearch );
		 *        }
		 *      } );
		 *    } );
             */
            "fnStateLoaded": null,


            /**
             * Save the table state. This function allows you to define where and how the state
             * information for the table is stored By default DataTables will use `localStorage`
             * but you might wish to use a server-side database or cookies.
             *  @type function
             *  @member
             *  @param {object} settings DataTables settings object
             *  @param {object} data The state object to be saved
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.stateSaveCallback
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateSave": true,
		 *        "stateSaveCallback": function (settings, data) {
		 *          // Send an Ajax request to the server with the state object
		 *          $.ajax( {
		 *            "url": "/state_save",
		 *            "data": data,
		 *            "dataType": "json",
		 *            "method": "POST"
		 *            "success": function () {}
		 *          } );
		 *        }
		 *      } );
		 *    } );
             */
            "fnStateSaveCallback": function (settings, data) {
                try {
                    localStorage.setItem(
                        'DataTables_' + settings.sInstance + '_' + window.location.pathname,
                        JSON.stringify(data)
                    );
                } catch (e) {
                }
            },


            /**
             * Callback which allows modification of the state to be saved. Called when the table
             * has changed state a new state save is required. This method allows modification of
             * the state saving object prior to actually doing the save, including addition or
             * other state properties or modification. Note that for plug-in authors, you should
             * use the `stateSaveParams` event to save parameters for a plug-in.
             *  @type function
             *  @param {object} settings DataTables settings object
             *  @param {object} data The state object to be saved
             *
             *  @dtopt Callbacks
             *  @name DataTable.defaults.stateSaveParams
             *
             *  @example
             *    // Remove a saved filter, so filtering is never saved
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateSave": true,
		 *        "stateSaveParams": function (settings, data) {
		 *          data.oSearch.sSearch = "";
		 *        }
		 *      } );
		 *    } );
             */
            "fnStateSaveParams": null,


            /**
             * Duration for which the saved state information is considered valid. After this period
             * has elapsed the state will be returned to the default.
             * Value is given in seconds.
             *  @type int
             *  @default 7200 <i>(2 hours)</i>
             *
             *  @dtopt Options
             *  @name DataTable.defaults.stateDuration
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "stateDuration": 60*60*24; // 1 day
		 *      } );
		 *    } )
             */
            "iStateDuration": 7200,


            /**
             * When enabled DataTables will not make a request to the server for the first
             * page draw - rather it will use the data already on the page (no sorting etc
             * will be applied to it), thus saving on an XHR at load time. `deferLoading`
             * is used to indicate that deferred loading is required, but it is also used
             * to tell DataTables how many records there are in the full table (allowing
             * the information element and pagination to be displayed correctly). In the case
             * where a filtering is applied to the table on initial load, this can be
             * indicated by giving the parameter as an array, where the first element is
             * the number of records available after filtering and the second element is the
             * number of records without filtering (allowing the table information element
             * to be shown correctly).
             *  @type int | array
             *  @default null
             *
             *  @dtopt Options
             *  @name DataTable.defaults.deferLoading
             *
             *  @example
             *    // 57 records available in the table, no filtering applied
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "serverSide": true,
		 *        "ajax": "scripts/server_processing.php",
		 *        "deferLoading": 57
		 *      } );
		 *    } );
             *
             *  @example
             *    // 57 records after filtering, 100 without filtering (an initial filter applied)
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "serverSide": true,
		 *        "ajax": "scripts/server_processing.php",
		 *        "deferLoading": [ 57, 100 ],
		 *        "search": {
		 *          "search": "my_filter"
		 *        }
		 *      } );
		 *    } );
             */
            "iDeferLoading": null,


            /**
             * Number of rows to display on a single page when using pagination. If
             * feature enabled (`lengthChange`) then the end user will be able to override
             * this to a custom setting using a pop-up menu.
             *  @type int
             *  @default 10
             *
             *  @dtopt Options
             *  @name DataTable.defaults.pageLength
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "pageLength": 50
		 *      } );
		 *    } )
             */
            "iDisplayLength": 10,


            /**
             * Define the starting point for data display when using DataTables with
             * pagination. Note that this parameter is the number of records, rather than
             * the page number, so if you have 10 records per page and want to start on
             * the third page, it should be "20".
             *  @type int
             *  @default 0
             *
             *  @dtopt Options
             *  @name DataTable.defaults.displayStart
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "displayStart": 20
		 *      } );
		 *    } )
             */
            "iDisplayStart": 0,


            /**
             * By default DataTables allows keyboard navigation of the table (sorting, paging,
             * and filtering) by adding a `tabindex` attribute to the required elements. This
             * allows you to tab through the controls and press the enter key to activate them.
             * The tabindex is default 0, meaning that the tab follows the flow of the document.
             * You can overrule this using this parameter if you wish. Use a value of -1 to
             * disable built-in keyboard navigation.
             *  @type int
             *  @default 0
             *
             *  @dtopt Options
             *  @name DataTable.defaults.tabIndex
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "tabIndex": 1
		 *      } );
		 *    } );
             */
            "iTabIndex": 0,


            /**
             * Classes that DataTables assigns to the various components and features
             * that it adds to the HTML table. This allows classes to be configured
             * during initialisation in addition to through the static
             * {@link DataTable.ext.oStdClasses} object).
             *  @namespace
             *  @name DataTable.defaults.classes
             */
            "oClasses": {},


            /**
             * All strings that DataTables uses in the user interface that it creates
             * are defined in this object, allowing you to modified them individually or
             * completely replace them all as required.
             *  @namespace
             *  @name DataTable.defaults.language
             */
            "oLanguage": {
                /**
                 * Strings that are used for WAI-ARIA labels and controls only (these are not
                 * actually visible on the page, but will be read by screenreaders, and thus
                 * must be internationalised as well).
                 *  @namespace
                 *  @name DataTable.defaults.language.aria
                 */
                "oAria": {
                    /**
                     * ARIA label that is added to the table headers when the column may be
                     * sorted ascending by activing the column (click or return when focused).
                     * Note that the column header is prefixed to this string.
                     *  @type string
                     *  @default : activate to sort column ascending
                     *
                     *  @dtopt Language
                     *  @name DataTable.defaults.language.aria.sortAscending
                     *
                     *  @example
                     *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "aria": {
				 *            "sortAscending": " - click/return to sort ascending"
				 *          }
				 *        }
				 *      } );
				 *    } );
                     */
                    "sSortAscending": ": activate to sort column ascending",

                    /**
                     * ARIA label that is added to the table headers when the column may be
                     * sorted descending by activing the column (click or return when focused).
                     * Note that the column header is prefixed to this string.
                     *  @type string
                     *  @default : activate to sort column ascending
                     *
                     *  @dtopt Language
                     *  @name DataTable.defaults.language.aria.sortDescending
                     *
                     *  @example
                     *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "aria": {
				 *            "sortDescending": " - click/return to sort descending"
				 *          }
				 *        }
				 *      } );
				 *    } );
                     */
                    "sSortDescending": ": activate to sort column descending"
                },

                /**
                 * Pagination string used by DataTables for the built-in pagination
                 * control types.
                 *  @namespace
                 *  @name DataTable.defaults.language.paginate
                 */
                "oPaginate": {
                    /**
                     * Text to use when using the 'full_numbers' type of pagination for the
                     * button to take the user to the first page.
                     *  @type string
                     *  @default First
                     *
                     *  @dtopt Language
                     *  @name DataTable.defaults.language.paginate.first
                     *
                     *  @example
                     *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "paginate": {
				 *            "first": "First page"
				 *          }
				 *        }
				 *      } );
				 *    } );
                     */
                    "sFirst": "First",


                    /**
                     * Text to use when using the 'full_numbers' type of pagination for the
                     * button to take the user to the last page.
                     *  @type string
                     *  @default Last
                     *
                     *  @dtopt Language
                     *  @name DataTable.defaults.language.paginate.last
                     *
                     *  @example
                     *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "paginate": {
				 *            "last": "Last page"
				 *          }
				 *        }
				 *      } );
				 *    } );
                     */
                    "sLast": "Last",


                    /**
                     * Text to use for the 'next' pagination button (to take the user to the
                     * next page).
                     *  @type string
                     *  @default Next
                     *
                     *  @dtopt Language
                     *  @name DataTable.defaults.language.paginate.next
                     *
                     *  @example
                     *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "paginate": {
				 *            "next": "Next page"
				 *          }
				 *        }
				 *      } );
				 *    } );
                     */
                    "sNext": "Next",


                    /**
                     * Text to use for the 'previous' pagination button (to take the user to
                     * the previous page).
                     *  @type string
                     *  @default Previous
                     *
                     *  @dtopt Language
                     *  @name DataTable.defaults.language.paginate.previous
                     *
                     *  @example
                     *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "paginate": {
				 *            "previous": "Previous page"
				 *          }
				 *        }
				 *      } );
				 *    } );
                     */
                    "sPrevious": "Previous"
                },

                /**
                 * This string is shown in preference to `zeroRecords` when the table is
                 * empty of data (regardless of filtering). Note that this is an optional
                 * parameter - if it is not given, the value of `zeroRecords` will be used
                 * instead (either the default or given value).
                 *  @type string
                 *  @default No data available in table
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.emptyTable
                 *
                 *  @example
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "emptyTable": "No data available in table"
			 *        }
			 *      } );
			 *    } );
                 */
                "sEmptyTable": "No data available in table",


                /**
                 * This string gives information to the end user about the information
                 * that is current on display on the page. The following tokens can be
                 * used in the string and will be dynamically replaced as the table
                 * display updates. This tokens can be placed anywhere in the string, or
                 * removed as needed by the language requires:
                 *
                 * * `\_START\_` - Display index of the first record on the current page
                 * * `\_END\_` - Display index of the last record on the current page
                 * * `\_TOTAL\_` - Number of records in the table after filtering
                 * * `\_MAX\_` - Number of records in the table without filtering
                 * * `\_PAGE\_` - Current page number
                 * * `\_PAGES\_` - Total number of pages of data in the table
                 *
                 *  @type string
                 *  @default Showing _START_ to _END_ of _TOTAL_ entries
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.info
                 *
                 *  @example
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "info": "Showing page _PAGE_ of _PAGES_"
			 *        }
			 *      } );
			 *    } );
                 */
                "sInfo": "Showing _START_ to _END_ of _TOTAL_ entries",


                /**
                 * Display information string for when the table is empty. Typically the
                 * format of this string should match `info`.
                 *  @type string
                 *  @default Showing 0 to 0 of 0 entries
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.infoEmpty
                 *
                 *  @example
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "infoEmpty": "No entries to show"
			 *        }
			 *      } );
			 *    } );
                 */
                "sInfoEmpty": "Showing 0 to 0 of 0 entries",


                /**
                 * When a user filters the information in a table, this string is appended
                 * to the information (`info`) to give an idea of how strong the filtering
                 * is. The variable _MAX_ is dynamically updated.
                 *  @type string
                 *  @default (filtered from _MAX_ total entries)
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.infoFiltered
                 *
                 *  @example
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "infoFiltered": " - filtering from _MAX_ records"
			 *        }
			 *      } );
			 *    } );
                 */
                "sInfoFiltered": "(filtered from _MAX_ total entries)",


                /**
                 * If can be useful to append extra information to the info string at times,
                 * and this variable does exactly that. This information will be appended to
                 * the `info` (`infoEmpty` and `infoFiltered` in whatever combination they are
                 * being used) at all times.
                 *  @type string
                 *  @default <i>Empty string</i>
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.infoPostFix
                 *
                 *  @example
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "infoPostFix": "All records shown are derived from real information."
			 *        }
			 *      } );
			 *    } );
                 */
                "sInfoPostFix": "",


                /**
                 * This decimal place operator is a little different from the other
                 * language options since DataTables doesn't output floating point
                 * numbers, so it won't ever use this for display of a number. Rather,
                 * what this parameter does is modify the sort methods of the table so
                 * that numbers which are in a format which has a character other than
                 * a period (`.`) as a decimal place will be sorted numerically.
                 *
                 * Note that numbers with different decimal places cannot be shown in
                 * the same table and still be sortable, the table must be consistent.
                 * However, multiple different tables on the page can use different
                 * decimal place characters.
                 *  @type string
                 *  @default
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.decimal
                 *
                 *  @example
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "decimal": ","
			 *          "thousands": "."
			 *        }
			 *      } );
			 *    } );
                 */
                "sDecimal": "",


                /**
                 * DataTables has a build in number formatter (`formatNumber`) which is
                 * used to format large numbers that are used in the table information.
                 * By default a comma is used, but this can be trivially changed to any
                 * character you wish with this parameter.
                 *  @type string
                 *  @default ,
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.thousands
                 *
                 *  @example
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "thousands": "'"
			 *        }
			 *      } );
			 *    } );
                 */
                "sThousands": ",",


                /**
                 * Detail the action that will be taken when the drop down menu for the
                 * pagination length option is changed. The '_MENU_' variable is replaced
                 * with a default select list of 10, 25, 50 and 100, and can be replaced
                 * with a custom select box if required.
                 *  @type string
                 *  @default Show _MENU_ entries
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.lengthMenu
                 *
                 *  @example
                 *    // Language change only
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "lengthMenu": "Display _MENU_ records"
			 *        }
			 *      } );
			 *    } );
                 *
                 *  @example
                 *    // Language and options change
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "lengthMenu": 'Display <select>'+
			 *            '<option value="10">10</option>'+
			 *            '<option value="20">20</option>'+
			 *            '<option value="30">30</option>'+
			 *            '<option value="40">40</option>'+
			 *            '<option value="50">50</option>'+
			 *            '<option value="-1">All</option>'+
			 *            '</select> records'
			 *        }
			 *      } );
			 *    } );
                 */
                "sLengthMenu": "Show _MENU_ entries",


                /**
                 * When using Ajax sourced data and during the first draw when DataTables is
                 * gathering the data, this message is shown in an empty row in the table to
                 * indicate to the end user the the data is being loaded. Note that this
                 * parameter is not used when loading data by server-side processing, just
                 * Ajax sourced data with client-side processing.
                 *  @type string
                 *  @default Loading...
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.loadingRecords
                 *
                 *  @example
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "loadingRecords": "Please wait - loading..."
			 *        }
			 *      } );
			 *    } );
                 */
                "sLoadingRecords": "Loading...",


                /**
                 * Text which is displayed when the table is processing a user action
                 * (usually a sort command or similar).
                 *  @type string
                 *  @default Processing...
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.processing
                 *
                 *  @example
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "processing": "DataTables is currently busy"
			 *        }
			 *      } );
			 *    } );
                 */
                "sProcessing": "Processing...",


                /**
                 * Details the actions that will be taken when the user types into the
                 * filtering input text box. The variable "_INPUT_", if used in the string,
                 * is replaced with the HTML text box for the filtering input allowing
                 * control over where it appears in the string. If "_INPUT_" is not given
                 * then the input box is appended to the string automatically.
                 *  @type string
                 *  @default Search:
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.search
                 *
                 *  @example
                 *    // Input text box will be appended at the end automatically
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "search": "Filter records:"
			 *        }
			 *      } );
			 *    } );
                 *
                 *  @example
                 *    // Specify where the filter should appear
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "search": "Apply filter _INPUT_ to table"
			 *        }
			 *      } );
			 *    } );
                 */
                "sSearch": "Search:",


                /**
                 * All of the language information can be stored in a file on the
                 * server-side, which DataTables will look up if this parameter is passed.
                 * It must store the URL of the language file, which is in a JSON format,
                 * and the object has the same properties as the oLanguage object in the
                 * initialiser object (i.e. the above parameters). Please refer to one of
                 * the example language files to see how this works in action.
                 *  @type string
                 *  @default <i>Empty string - i.e. disabled</i>
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.url
                 *
                 *  @example
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "url": "http://www.sprymedia.co.uk/dataTables/lang.txt"
			 *        }
			 *      } );
			 *    } );
                 */
                "sUrl": "",


                /**
                 * Text shown inside the table records when the is no information to be
                 * displayed after filtering. `emptyTable` is shown when there is simply no
                 * information in the table at all (regardless of filtering).
                 *  @type string
                 *  @default No matching records found
                 *
                 *  @dtopt Language
                 *  @name DataTable.defaults.language.zeroRecords
                 *
                 *  @example
                 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "language": {
			 *          "zeroRecords": "No records to display"
			 *        }
			 *      } );
			 *    } );
                 */
                "sZeroRecords": "No matching records found"
            },


            /**
             * This parameter allows you to have define the global filtering state at
             * initialisation time. As an object the `search` parameter must be
             * defined, but all other parameters are optional. When `regex` is true,
             * the search string will be treated as a regular expression, when false
             * (default) it will be treated as a straight string. When `smart`
             * DataTables will use it's smart filtering methods (to word match at
             * any point in the data), when false this will not be done.
             *  @namespace
             *  @extends DataTable.models.oSearch
             *
             *  @dtopt Options
             *  @name DataTable.defaults.search
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "search": {"search": "Initial search"}
		 *      } );
		 *    } )
             */
            "oSearch": $.extend({}, DataTable.models.oSearch),


            /**
             * __Deprecated__ The functionality provided by this parameter has now been
             * superseded by that provided through `ajax`, which should be used instead.
             *
             * By default DataTables will look for the property `data` (or `aaData` for
             * compatibility with DataTables 1.9-) when obtaining data from an Ajax
             * source or for server-side processing - this parameter allows that
             * property to be changed. You can use Javascript dotted object notation to
             * get a data source for multiple levels of nesting.
             *  @type string
             *  @default data
             *
             *  @dtopt Options
             *  @dtopt Server-side
             *  @name DataTable.defaults.ajaxDataProp
             *
             *  @deprecated 1.10. Please use `ajax` for this functionality now.
             */
            "sAjaxDataProp": "data",


            /**
             * __Deprecated__ The functionality provided by this parameter has now been
             * superseded by that provided through `ajax`, which should be used instead.
             *
             * You can instruct DataTables to load data from an external
             * source using this parameter (use aData if you want to pass data in you
             * already have). Simply provide a url a JSON object can be obtained from.
             *  @type string
             *  @default null
             *
             *  @dtopt Options
             *  @dtopt Server-side
             *  @name DataTable.defaults.ajaxSource
             *
             *  @deprecated 1.10. Please use `ajax` for this functionality now.
             */
            "sAjaxSource": null,


            /**
             * This initialisation variable allows you to specify exactly where in the
             * DOM you want DataTables to inject the various controls it adds to the page
             * (for example you might want the pagination controls at the top of the
             * table). DIV elements (with or without a custom class) can also be added to
             * aid styling. The follow syntax is used:
             *   <ul>
             *     <li>The following options are allowed:
             *       <ul>
             *         <li>'l' - Length changing</li>
             *         <li>'f' - Filtering input</li>
             *         <li>'t' - The table!</li>
             *         <li>'i' - Information</li>
             *         <li>'p' - Pagination</li>
             *         <li>'r' - pRocessing</li>
             *       </ul>
             *     </li>
             *     <li>The following constants are allowed:
             *       <ul>
             *         <li>'H' - jQueryUI theme "header" classes ('fg-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix')</li>
             *         <li>'F' - jQueryUI theme "footer" classes ('fg-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix')</li>
             *       </ul>
             *     </li>
             *     <li>The following syntax is expected:
             *       <ul>
             *         <li>'&lt;' and '&gt;' - div elements</li>
             *         <li>'&lt;"class" and '&gt;' - div with a class</li>
             *         <li>'&lt;"#id" and '&gt;' - div with an ID</li>
             *       </ul>
             *     </li>
             *     <li>Examples:
             *       <ul>
             *         <li>'&lt;"wrapper"flipt&gt;'</li>
             *         <li>'&lt;lf&lt;t&gt;ip&gt;'</li>
             *       </ul>
             *     </li>
             *   </ul>
             *  @type string
             *  @default lfrtip <i>(when `jQueryUI` is false)</i> <b>or</b>
             *    <"H"lfr>t<"F"ip> <i>(when `jQueryUI` is true)</i>
             *
             *  @dtopt Options
             *  @name DataTable.defaults.dom
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "dom": '&lt;"top"i&gt;rt&lt;"bottom"flp&gt;&lt;"clear"&gt;'
		 *      } );
		 *    } );
             */
            "sDom": "lfrtip",


            /**
             * DataTables features four different built-in options for the buttons to
             * display for pagination control:
             *
             * * `simple` - 'Previous' and 'Next' buttons only
             * * 'simple_numbers` - 'Previous' and 'Next' buttons, plus page numbers
             * * `full` - 'First', 'Previous', 'Next' and 'Last' buttons
             * * `full_numbers` - 'First', 'Previous', 'Next' and 'Last' buttons, plus
             *   page numbers
             *
             * Further methods can be added using {@link DataTable.ext.oPagination}.
             *  @type string
             *  @default simple_numbers
             *
             *  @dtopt Options
             *  @name DataTable.defaults.pagingType
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "pagingType": "full_numbers"
		 *      } );
		 *    } )
             */
            "sPaginationType": "simple_numbers",


            /**
             * Enable horizontal scrolling. When a table is too wide to fit into a
             * certain layout, or you have a large number of columns in the table, you
             * can enable x-scrolling to show the table in a viewport, which can be
             * scrolled. This property can be `true` which will allow the table to
             * scroll horizontally when needed, or any CSS unit, or a number (in which
             * case it will be treated as a pixel measurement). Setting as simply `true`
             * is recommended.
             *  @type boolean|string
             *  @default <i>blank string - i.e. disabled</i>
             *
             *  @dtopt Features
             *  @name DataTable.defaults.scrollX
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "scrollX": true,
		 *        "scrollCollapse": true
		 *      } );
		 *    } );
             */
            "sScrollX": "",


            /**
             * This property can be used to force a DataTable to use more width than it
             * might otherwise do when x-scrolling is enabled. For example if you have a
             * table which requires to be well spaced, this parameter is useful for
             * "over-sizing" the table, and thus forcing scrolling. This property can by
             * any CSS unit, or a number (in which case it will be treated as a pixel
             * measurement).
             *  @type string
             *  @default <i>blank string - i.e. disabled</i>
             *
             *  @dtopt Options
             *  @name DataTable.defaults.scrollXInner
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "scrollX": "100%",
		 *        "scrollXInner": "110%"
		 *      } );
		 *    } );
             */
            "sScrollXInner": "",


            /**
             * Enable vertical scrolling. Vertical scrolling will constrain the DataTable
             * to the given height, and enable scrolling for any data which overflows the
             * current viewport. This can be used as an alternative to paging to display
             * a lot of data in a small area (although paging and scrolling can both be
             * enabled at the same time). This property can be any CSS unit, or a number
             * (in which case it will be treated as a pixel measurement).
             *  @type string
             *  @default <i>blank string - i.e. disabled</i>
             *
             *  @dtopt Features
             *  @name DataTable.defaults.scrollY
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "scrollY": "200px",
		 *        "paginate": false
		 *      } );
		 *    } );
             */
            "sScrollY": "",


            /**
             * __Deprecated__ The functionality provided by this parameter has now been
             * superseded by that provided through `ajax`, which should be used instead.
             *
             * Set the HTTP method that is used to make the Ajax call for server-side
             * processing or Ajax sourced data.
             *  @type string
             *  @default GET
             *
             *  @dtopt Options
             *  @dtopt Server-side
             *  @name DataTable.defaults.serverMethod
             *
             *  @deprecated 1.10. Please use `ajax` for this functionality now.
             */
            "sServerMethod": "GET",


            /**
             * DataTables makes use of renderers when displaying HTML elements for
             * a table. These renderers can be added or modified by plug-ins to
             * generate suitable mark-up for a site. For example the Bootstrap
             * integration plug-in for DataTables uses a paging button renderer to
             * display pagination buttons in the mark-up required by Bootstrap.
             *
             * For further information about the renderers available see
             * DataTable.ext.renderer
             *  @type string|object
             *  @default null
             *
             *  @name DataTable.defaults.renderer
             *
             */
            "renderer": null
        };

        _fnHungarianMap(DataTable.defaults);


        /*
	 * Developer note - See note in model.defaults.js about the use of Hungarian
	 * notation and camel case.
	 */

        /**
         * Column options that can be given to DataTables at initialisation time.
         *  @namespace
         */
        DataTable.defaults.column = {
            /**
             * Define which column(s) an order will occur on for this column. This
             * allows a column's ordering to take multiple columns into account when
             * doing a sort or use the data from a different column. For example first
             * name / last name columns make sense to do a multi-column sort over the
             * two columns.
             *  @type array|int
             *  @default null <i>Takes the value of the column index automatically</i>
             *
             *  @name DataTable.defaults.column.orderData
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "orderData": [ 0, 1 ], "targets": [ 0 ] },
		 *          { "orderData": [ 1, 0 ], "targets": [ 1 ] },
		 *          { "orderData": 2, "targets": [ 2 ] }
		 *        ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "orderData": [ 0, 1 ] },
		 *          { "orderData": [ 1, 0 ] },
		 *          { "orderData": 2 },
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
             */
            "aDataSort": null,
            "iDataSort": -1,


            /**
             * You can control the default ordering direction, and even alter the
             * behaviour of the sort handler (i.e. only allow ascending ordering etc)
             * using this parameter.
             *  @type array
             *  @default [ 'asc', 'desc' ]
             *
             *  @name DataTable.defaults.column.orderSequence
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "orderSequence": [ "asc" ], "targets": [ 1 ] },
		 *          { "orderSequence": [ "desc", "asc", "asc" ], "targets": [ 2 ] },
		 *          { "orderSequence": [ "desc" ], "targets": [ 3 ] }
		 *        ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          null,
		 *          { "orderSequence": [ "asc" ] },
		 *          { "orderSequence": [ "desc", "asc", "asc" ] },
		 *          { "orderSequence": [ "desc" ] },
		 *          null
		 *        ]
		 *      } );
		 *    } );
             */
            "asSorting": ['asc', 'desc'],


            /**
             * Enable or disable filtering on the data in this column.
             *  @type boolean
             *  @default true
             *
             *  @name DataTable.defaults.column.searchable
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "searchable": false, "targets": [ 0 ] }
		 *        ] } );
		 *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "searchable": false },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ] } );
		 *    } );
             */
            "bSearchable": true,


            /**
             * Enable or disable ordering on this column.
             *  @type boolean
             *  @default true
             *
             *  @name DataTable.defaults.column.orderable
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "orderable": false, "targets": [ 0 ] }
		 *        ] } );
		 *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "orderable": false },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ] } );
		 *    } );
             */
            "bSortable": true,


            /**
             * Enable or disable the display of this column.
             *  @type boolean
             *  @default true
             *
             *  @name DataTable.defaults.column.visible
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "visible": false, "targets": [ 0 ] }
		 *        ] } );
		 *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "visible": false },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ] } );
		 *    } );
             */
            "bVisible": true,


            /**
             * Developer definable function that is called whenever a cell is created (Ajax source,
             * etc) or processed for input (DOM source). This can be used as a compliment to mRender
             * allowing you to modify the DOM element (add background colour for example) when the
             * element is available.
             *  @type function
             *  @param {element} td The TD node that has been created
             *  @param {*} cellData The Data for the cell
             *  @param {array|object} rowData The data for the whole row
             *  @param {int} row The row index for the aoData data store
             *  @param {int} col The column index for aoColumns
             *
             *  @name DataTable.defaults.column.createdCell
             *  @dtopt Columns
             *
             *  @example
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [3],
		 *          "createdCell": function (td, cellData, rowData, row, col) {
		 *            if ( cellData == "1.7" ) {
		 *              $(td).css('color', 'blue')
		 *            }
		 *          }
		 *        } ]
		 *      });
		 *    } );
             */
            "fnCreatedCell": null,


            /**
             * This parameter has been replaced by `data` in DataTables to ensure naming
             * consistency. `dataProp` can still be used, as there is backwards
             * compatibility in DataTables for this option, but it is strongly
             * recommended that you use `data` in preference to `dataProp`.
             *  @name DataTable.defaults.column.dataProp
             */


            /**
             * This property can be used to read data from any data source property,
             * including deeply nested objects / properties. `data` can be given in a
             * number of different ways which effect its behaviour:
             *
             * * `integer` - treated as an array index for the data source. This is the
             *   default that DataTables uses (incrementally increased for each column).
             * * `string` - read an object property from the data source. There are
             *   three 'special' options that can be used in the string to alter how
             *   DataTables reads the data from the source object:
             *    * `.` - Dotted Javascript notation. Just as you use a `.` in
             *      Javascript to read from nested objects, so to can the options
             *      specified in `data`. For example: `browser.version` or
             *      `browser.name`. If your object parameter name contains a period, use
             *      `\\` to escape it - i.e. `first\\.name`.
             *    * `[]` - Array notation. DataTables can automatically combine data
             *      from and array source, joining the data with the characters provided
             *      between the two brackets. For example: `name[, ]` would provide a
             *      comma-space separated list from the source array. If no characters
             *      are provided between the brackets, the original array source is
             *      returned.
             *    * `()` - Function notation. Adding `()` to the end of a parameter will
             *      execute a function of the name given. For example: `browser()` for a
             *      simple function on the data source, `browser.version()` for a
             *      function in a nested property or even `browser().version` to get an
             *      object property if the function called returns an object. Note that
             *      function notation is recommended for use in `render` rather than
             *      `data` as it is much simpler to use as a renderer.
             * * `null` - use the original data source for the row rather than plucking
             *   data directly from it. This action has effects on two other
             *   initialisation options:
             *    * `defaultContent` - When null is given as the `data` option and
             *      `defaultContent` is specified for the column, the value defined by
             *      `defaultContent` will be used for the cell.
             *    * `render` - When null is used for the `data` option and the `render`
             *      option is specified for the column, the whole data source for the
             *      row is used for the renderer.
             * * `function` - the function given will be executed whenever DataTables
             *   needs to set or get the data for a cell in the column. The function
             *   takes three parameters:
             *    * Parameters:
             *      * `{array|object}` The data source for the row
             *      * `{string}` The type call data requested - this will be 'set' when
             *        setting data or 'filter', 'display', 'type', 'sort' or undefined
             *        when gathering data. Note that when `undefined` is given for the
             *        type DataTables expects to get the raw data for the object back<
             *      * `{*}` Data to set when the second parameter is 'set'.
             *    * Return:
             *      * The return value from the function is not required when 'set' is
             *        the type of call, but otherwise the return is what will be used
             *        for the data requested.
             *
             * Note that `data` is a getter and setter option. If you just require
             * formatting of data for output, you will likely want to use `render` which
             * is simply a getter and thus simpler to use.
             *
             * Note that prior to DataTables 1.9.2 `data` was called `mDataProp`. The
             * name change reflects the flexibility of this property and is consistent
             * with the naming of mRender. If 'mDataProp' is given, then it will still
             * be used by DataTables, as it automatically maps the old name to the new
             * if required.
             *
             *  @type string|int|function|null
             *  @default null <i>Use automatically calculated column index</i>
             *
             *  @name DataTable.defaults.column.data
             *  @dtopt Columns
             *
             *  @example
             *    // Read table data from objects
             *    // JSON structure for each row:
             *    //   {
		 *    //      "engine": {value},
		 *    //      "browser": {value},
		 *    //      "platform": {value},
		 *    //      "version": {value},
		 *    //      "grade": {value}
		 *    //   }
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "ajaxSource": "sources/objects.txt",
		 *        "columns": [
		 *          { "data": "engine" },
		 *          { "data": "browser" },
		 *          { "data": "platform" },
		 *          { "data": "version" },
		 *          { "data": "grade" }
		 *        ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Read information from deeply nested objects
             *    // JSON structure for each row:
             *    //   {
		 *    //      "engine": {value},
		 *    //      "browser": {value},
		 *    //      "platform": {
		 *    //         "inner": {value}
		 *    //      },
		 *    //      "details": [
		 *    //         {value}, {value}
		 *    //      ]
		 *    //   }
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "ajaxSource": "sources/deep.txt",
		 *        "columns": [
		 *          { "data": "engine" },
		 *          { "data": "browser" },
		 *          { "data": "platform.inner" },
		 *          { "data": "platform.details.0" },
		 *          { "data": "platform.details.1" }
		 *        ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Using `data` as a function to provide different information for
             *    // sorting, filtering and display. In this case, currency (price)
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": function ( source, type, val ) {
		 *            if (type === 'set') {
		 *              source.price = val;
		 *              // Store the computed dislay and filter values for efficiency
		 *              source.price_display = val=="" ? "" : "$"+numberFormat(val);
		 *              source.price_filter  = val=="" ? "" : "$"+numberFormat(val)+" "+val;
		 *              return;
		 *            }
		 *            else if (type === 'display') {
		 *              return source.price_display;
		 *            }
		 *            else if (type === 'filter') {
		 *              return source.price_filter;
		 *            }
		 *            // 'sort', 'type' and undefined all just use the integer
		 *            return source.price;
		 *          }
		 *        } ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Using default content
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": null,
		 *          "defaultContent": "Click to edit"
		 *        } ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Using array notation - outputting a list from an array
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": "name[, ]"
		 *        } ]
		 *      } );
		 *    } );
             *
             */
            "mData": null,


            /**
             * This property is the rendering partner to `data` and it is suggested that
             * when you want to manipulate data for display (including filtering,
             * sorting etc) without altering the underlying data for the table, use this
             * property. `render` can be considered to be the the read only companion to
             * `data` which is read / write (then as such more complex). Like `data`
             * this option can be given in a number of different ways to effect its
             * behaviour:
             *
             * * `integer` - treated as an array index for the data source. This is the
             *   default that DataTables uses (incrementally increased for each column).
             * * `string` - read an object property from the data source. There are
             *   three 'special' options that can be used in the string to alter how
             *   DataTables reads the data from the source object:
             *    * `.` - Dotted Javascript notation. Just as you use a `.` in
             *      Javascript to read from nested objects, so to can the options
             *      specified in `data`. For example: `browser.version` or
             *      `browser.name`. If your object parameter name contains a period, use
             *      `\\` to escape it - i.e. `first\\.name`.
             *    * `[]` - Array notation. DataTables can automatically combine data
             *      from and array source, joining the data with the characters provided
             *      between the two brackets. For example: `name[, ]` would provide a
             *      comma-space separated list from the source array. If no characters
             *      are provided between the brackets, the original array source is
             *      returned.
             *    * `()` - Function notation. Adding `()` to the end of a parameter will
             *      execute a function of the name given. For example: `browser()` for a
             *      simple function on the data source, `browser.version()` for a
             *      function in a nested property or even `browser().version` to get an
             *      object property if the function called returns an object.
             * * `object` - use different data for the different data types requested by
             *   DataTables ('filter', 'display', 'type' or 'sort'). The property names
             *   of the object is the data type the property refers to and the value can
             *   defined using an integer, string or function using the same rules as
             *   `render` normally does. Note that an `_` option _must_ be specified.
             *   This is the default value to use if you haven't specified a value for
             *   the data type requested by DataTables.
             * * `function` - the function given will be executed whenever DataTables
             *   needs to set or get the data for a cell in the column. The function
             *   takes three parameters:
             *    * Parameters:
             *      * {array|object} The data source for the row (based on `data`)
             *      * {string} The type call data requested - this will be 'filter',
             *        'display', 'type' or 'sort'.
             *      * {array|object} The full data source for the row (not based on
             *        `data`)
             *    * Return:
             *      * The return value from the function is what will be used for the
             *        data requested.
             *
             *  @type string|int|function|object|null
             *  @default null Use the data source value.
             *
             *  @name DataTable.defaults.column.render
             *  @dtopt Columns
             *
             *  @example
             *    // Create a comma separated list from an array of objects
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "ajaxSource": "sources/deep.txt",
		 *        "columns": [
		 *          { "data": "engine" },
		 *          { "data": "browser" },
		 *          {
		 *            "data": "platform",
		 *            "render": "[, ].name"
		 *          }
		 *        ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Execute a function to obtain data
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": null, // Use the full data source object for the renderer's source
		 *          "render": "browserName()"
		 *        } ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // As an object, extracting different data for the different types
             *    // This would be used with a data source such as:
             *    //   { "phone": 5552368, "phone_filter": "5552368 555-2368", "phone_display": "555-2368" }
             *    // Here the `phone` integer is used for sorting and type detection, while `phone_filter`
             *    // (which has both forms) is used for filtering for if a user inputs either format, while
             *    // the formatted phone number is the one that is shown in the table.
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": null, // Use the full data source object for the renderer's source
		 *          "render": {
		 *            "_": "phone",
		 *            "filter": "phone_filter",
		 *            "display": "phone_display"
		 *          }
		 *        } ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Use as a function to create a link from the data source
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "data": "download_link",
		 *          "render": function ( data, type, full ) {
		 *            return '<a href="'+data+'">Download</a>';
		 *          }
		 *        } ]
		 *      } );
		 *    } );
             */
            "mRender": null,


            /**
             * Change the cell type created for the column - either TD cells or TH cells. This
             * can be useful as TH cells have semantic meaning in the table body, allowing them
             * to act as a header for a row (you may wish to add scope='row' to the TH elements).
             *  @type string
             *  @default td
             *
             *  @name DataTable.defaults.column.cellType
             *  @dtopt Columns
             *
             *  @example
             *    // Make the first column use TH cells
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [ {
		 *          "targets": [ 0 ],
		 *          "cellType": "th"
		 *        } ]
		 *      } );
		 *    } );
             */
            "sCellType": "td",


            /**
             * Class to give to each cell in this column.
             *  @type string
             *  @default <i>Empty string</i>
             *
             *  @name DataTable.defaults.column.class
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "class": "my_class", "targets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "class": "my_class" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
             */
            "sClass": "",

            /**
             * When DataTables calculates the column widths to assign to each column,
             * it finds the longest string in each column and then constructs a
             * temporary table and reads the widths from that. The problem with this
             * is that "mmm" is much wider then "iiii", but the latter is a longer
             * string - thus the calculation can go wrong (doing it properly and putting
             * it into an DOM object and measuring that is horribly(!) slow). Thus as
             * a "work around" we provide this option. It will append its value to the
             * text that is found to be the longest string for the column - i.e. padding.
             * Generally you shouldn't need this!
             *  @type string
             *  @default <i>Empty string<i>
             *
             *  @name DataTable.defaults.column.contentPadding
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          null,
		 *          null,
		 *          null,
		 *          {
		 *            "contentPadding": "mmm"
		 *          }
		 *        ]
		 *      } );
		 *    } );
             */
            "sContentPadding": "",


            /**
             * Allows a default value to be given for a column's data, and will be used
             * whenever a null data source is encountered (this can be because `data`
             * is set to null, or because the data source itself is null).
             *  @type string
             *  @default null
             *
             *  @name DataTable.defaults.column.defaultContent
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          {
		 *            "data": null,
		 *            "defaultContent": "Edit",
		 *            "targets": [ -1 ]
		 *          }
		 *        ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          null,
		 *          null,
		 *          null,
		 *          {
		 *            "data": null,
		 *            "defaultContent": "Edit"
		 *          }
		 *        ]
		 *      } );
		 *    } );
             */
            "sDefaultContent": null,


            /**
             * This parameter is only used in DataTables' server-side processing. It can
             * be exceptionally useful to know what columns are being displayed on the
             * client side, and to map these to database fields. When defined, the names
             * also allow DataTables to reorder information from the server if it comes
             * back in an unexpected order (i.e. if you switch your columns around on the
             * client-side, your server-side code does not also need updating).
             *  @type string
             *  @default <i>Empty string</i>
             *
             *  @name DataTable.defaults.column.name
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "name": "engine", "targets": [ 0 ] },
		 *          { "name": "browser", "targets": [ 1 ] },
		 *          { "name": "platform", "targets": [ 2 ] },
		 *          { "name": "version", "targets": [ 3 ] },
		 *          { "name": "grade", "targets": [ 4 ] }
		 *        ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "name": "engine" },
		 *          { "name": "browser" },
		 *          { "name": "platform" },
		 *          { "name": "version" },
		 *          { "name": "grade" }
		 *        ]
		 *      } );
		 *    } );
             */
            "sName": "",


            /**
             * Defines a data source type for the ordering which can be used to read
             * real-time information from the table (updating the internally cached
             * version) prior to ordering. This allows ordering to occur on user
             * editable elements such as form inputs.
             *  @type string
             *  @default std
             *
             *  @name DataTable.defaults.column.orderDataType
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "orderDataType": "dom-text", "targets": [ 2, 3 ] },
		 *          { "type": "numeric", "targets": [ 3 ] },
		 *          { "orderDataType": "dom-select", "targets": [ 4 ] },
		 *          { "orderDataType": "dom-checkbox", "targets": [ 5 ] }
		 *        ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          null,
		 *          null,
		 *          { "orderDataType": "dom-text" },
		 *          { "orderDataType": "dom-text", "type": "numeric" },
		 *          { "orderDataType": "dom-select" },
		 *          { "orderDataType": "dom-checkbox" }
		 *        ]
		 *      } );
		 *    } );
             */
            "sSortDataType": "std",


            /**
             * The title of this column.
             *  @type string
             *  @default null <i>Derived from the 'TH' value for this column in the
             *    original HTML table.</i>
             *
             *  @name DataTable.defaults.column.title
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "title": "My column title", "targets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "title": "My column title" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
             */
            "sTitle": null,


            /**
             * The type allows you to specify how the data for this column will be
             * ordered. Four types (string, numeric, date and html (which will strip
             * HTML tags before ordering)) are currently available. Note that only date
             * formats understood by Javascript's Date() object will be accepted as type
             * date. For example: "Mar 26, 2008 5:03 PM". May take the values: 'string',
             * 'numeric', 'date' or 'html' (by default). Further types can be adding
             * through plug-ins.
             *  @type string
             *  @default null <i>Auto-detected from raw data</i>
             *
             *  @name DataTable.defaults.column.type
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "type": "html", "targets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "type": "html" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
             */
            "sType": null,


            /**
             * Defining the width of the column, this parameter may take any CSS value
             * (3em, 20px etc). DataTables applies 'smart' widths to columns which have not
             * been given a specific width through this interface ensuring that the table
             * remains readable.
             *  @type string
             *  @default null <i>Automatic</i>
             *
             *  @name DataTable.defaults.column.width
             *  @dtopt Columns
             *
             *  @example
             *    // Using `columnDefs`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columnDefs": [
		 *          { "width": "20%", "targets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
             *
             *  @example
             *    // Using `columns`
             *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "columns": [
		 *          { "width": "20%" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
             */
            "sWidth": null
        };

        _fnHungarianMap(DataTable.defaults.column);


        /**
         * DataTables settings object - this holds all the information needed for a
         * given table, including configuration, data and current application of the
         * table options. DataTables does not have a single instance for each DataTable
         * with the settings attached to that instance, but rather instances of the
         * DataTable "class" are created on-the-fly as needed (typically by a
         * $().dataTable() call) and the settings object is then applied to that
         * instance.
         *
         * Note that this object is related to {@link DataTable.defaults} but this
         * one is the internal data store for DataTables's cache of columns. It should
         * NOT be manipulated outside of DataTables. Any configuration should be done
         * through the initialisation options.
         *  @namespace
         *  @todo Really should attach the settings object to individual instances so we
         *    don't need to create new instances on each $().dataTable() call (if the
         *    table already exists). It would also save passing oSettings around and
         *    into every single function. However, this is a very significant
         *    architecture change for DataTables and will almost certainly break
         *    backwards compatibility with older installations. This is something that
         *    will be done in 2.0.
         */
        DataTable.models.oSettings = {
            /**
             * Primary features of DataTables and their enablement state.
             *  @namespace
             */
            "oFeatures": {

                /**
                 * Flag to say if DataTables should automatically try to calculate the
                 * optimum table and columns widths (true) or not (false).
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bAutoWidth": null,

                /**
                 * Delay the creation of TR and TD elements until they are actually
                 * needed by a driven page draw. This can give a significant speed
                 * increase for Ajax source and Javascript source data, but makes no
                 * difference at all fro DOM and server-side processing tables.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bDeferRender": null,

                /**
                 * Enable filtering on the table or not. Note that if this is disabled
                 * then there is no filtering at all on the table, including fnFilter.
                 * To just remove the filtering input use sDom and remove the 'f' option.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bFilter": null,

                /**
                 * Table information element (the 'Showing x of y records' div) enable
                 * flag.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bInfo": null,

                /**
                 * Present a user control allowing the end user to change the page size
                 * when pagination is enabled.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bLengthChange": null,

                /**
                 * Pagination enabled or not. Note that if this is disabled then length
                 * changing must also be disabled.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bPaginate": null,

                /**
                 * Processing indicator enable flag whenever DataTables is enacting a
                 * user request - typically an Ajax request for server-side processing.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bProcessing": null,

                /**
                 * Server-side processing enabled flag - when enabled DataTables will
                 * get all data from the server for every draw - there is no filtering,
                 * sorting or paging done on the client-side.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bServerSide": null,

                /**
                 * Sorting enablement flag.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bSort": null,

                /**
                 * Multi-column sorting
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bSortMulti": null,

                /**
                 * Apply a class to the columns which are being sorted to provide a
                 * visual highlight or not. This can slow things down when enabled since
                 * there is a lot of DOM interaction.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bSortClasses": null,

                /**
                 * State saving enablement flag.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bStateSave": null
            },


            /**
             * Scrolling settings for a table.
             *  @namespace
             */
            "oScroll": {
                /**
                 * When the table is shorter in height than sScrollY, collapse the
                 * table container down to the height of the table (when true).
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type boolean
                 */
                "bCollapse": null,

                /**
                 * Width of the scrollbar for the web-browser's platform. Calculated
                 * during table initialisation.
                 *  @type int
                 *  @default 0
                 */
                "iBarWidth": 0,

                /**
                 * Viewport width for horizontal scrolling. Horizontal scrolling is
                 * disabled if an empty string.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type string
                 */
                "sX": null,

                /**
                 * Width to expand the table to when using x-scrolling. Typically you
                 * should not need to use this.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type string
                 *  @deprecated
                 */
                "sXInner": null,

                /**
                 * Viewport height for vertical scrolling. Vertical scrolling is disabled
                 * if an empty string.
                 * Note that this parameter will be set by the initialisation routine. To
                 * set a default use {@link DataTable.defaults}.
                 *  @type string
                 */
                "sY": null
            },

            /**
             * Language information for the table.
             *  @namespace
             *  @extends DataTable.defaults.oLanguage
             */
            "oLanguage": {
                /**
                 * Information callback function. See
                 * {@link DataTable.defaults.fnInfoCallback}
                 *  @type function
                 *  @default null
                 */
                "fnInfoCallback": null
            },

            /**
             * Browser support parameters
             *  @namespace
             */
            "oBrowser": {
                /**
                 * Indicate if the browser incorrectly calculates width:100% inside a
                 * scrolling element (IE6/7)
                 *  @type boolean
                 *  @default false
                 */
                "bScrollOversize": false,

                /**
                 * Determine if the vertical scrollbar is on the right or left of the
                 * scrolling container - needed for rtl language layout, although not
                 * all browsers move the scrollbar (Safari).
                 *  @type boolean
                 *  @default false
                 */
                "bScrollbarLeft": false
            },


            "ajax": null,


            /**
             * Array referencing the nodes which are used for the features. The
             * parameters of this object match what is allowed by sDom - i.e.
             *   <ul>
             *     <li>'l' - Length changing</li>
             *     <li>'f' - Filtering input</li>
             *     <li>'t' - The table!</li>
             *     <li>'i' - Information</li>
             *     <li>'p' - Pagination</li>
             *     <li>'r' - pRocessing</li>
             *   </ul>
             *  @type array
             *  @default []
             */
            "aanFeatures": [],

            /**
             * Store data information - see {@link DataTable.models.oRow} for detailed
             * information.
             *  @type array
             *  @default []
             */
            "aoData": [],

            /**
             * Array of indexes which are in the current display (after filtering etc)
             *  @type array
             *  @default []
             */
            "aiDisplay": [],

            /**
             * Array of indexes for display - no filtering
             *  @type array
             *  @default []
             */
            "aiDisplayMaster": [],

            /**
             * Store information about each column that is in use
             *  @type array
             *  @default []
             */
            "aoColumns": [],

            /**
             * Store information about the table's header
             *  @type array
             *  @default []
             */
            "aoHeader": [],

            /**
             * Store information about the table's footer
             *  @type array
             *  @default []
             */
            "aoFooter": [],

            /**
             * Store the applied global search information in case we want to force a
             * research or compare the old search to a new one.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @namespace
             *  @extends DataTable.models.oSearch
             */
            "oPreviousSearch": {},

            /**
             * Store the applied search for each column - see
             * {@link DataTable.models.oSearch} for the format that is used for the
             * filtering information for each column.
             *  @type array
             *  @default []
             */
            "aoPreSearchCols": [],

            /**
             * Sorting that is applied to the table. Note that the inner arrays are
             * used in the following manner:
             * <ul>
             *   <li>Index 0 - column number</li>
             *   <li>Index 1 - current sorting direction</li>
             * </ul>
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type array
             *  @todo These inner arrays should really be objects
             */
            "aaSorting": null,

            /**
             * Sorting that is always applied to the table (i.e. prefixed in front of
             * aaSorting).
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type array
             *  @default []
             */
            "aaSortingFixed": [],

            /**
             * Classes to use for the striping of a table.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type array
             *  @default []
             */
            "asStripeClasses": null,

            /**
             * If restoring a table - we should restore its striping classes as well
             *  @type array
             *  @default []
             */
            "asDestroyStripes": [],

            /**
             * If restoring a table - we should restore its width
             *  @type int
             *  @default 0
             */
            "sDestroyWidth": 0,

            /**
             * Callback functions array for every time a row is inserted (i.e. on a draw).
             *  @type array
             *  @default []
             */
            "aoRowCallback": [],

            /**
             * Callback functions for the header on each draw.
             *  @type array
             *  @default []
             */
            "aoHeaderCallback": [],

            /**
             * Callback function for the footer on each draw.
             *  @type array
             *  @default []
             */
            "aoFooterCallback": [],

            /**
             * Array of callback functions for draw callback functions
             *  @type array
             *  @default []
             */
            "aoDrawCallback": [],

            /**
             * Array of callback functions for row created function
             *  @type array
             *  @default []
             */
            "aoRowCreatedCallback": [],

            /**
             * Callback functions for just before the table is redrawn. A return of
             * false will be used to cancel the draw.
             *  @type array
             *  @default []
             */
            "aoPreDrawCallback": [],

            /**
             * Callback functions for when the table has been initialised.
             *  @type array
             *  @default []
             */
            "aoInitComplete": [],


            /**
             * Callbacks for modifying the settings to be stored for state saving, prior to
             * saving state.
             *  @type array
             *  @default []
             */
            "aoStateSaveParams": [],

            /**
             * Callbacks for modifying the settings that have been stored for state saving
             * prior to using the stored values to restore the state.
             *  @type array
             *  @default []
             */
            "aoStateLoadParams": [],

            /**
             * Callbacks for operating on the settings object once the saved state has been
             * loaded
             *  @type array
             *  @default []
             */
            "aoStateLoaded": [],

            /**
             * Cache the table ID for quick access
             *  @type string
             *  @default <i>Empty string</i>
             */
            "sTableId": "",

            /**
             * The TABLE node for the main table
             *  @type node
             *  @default null
             */
            "nTable": null,

            /**
             * Permanent ref to the thead element
             *  @type node
             *  @default null
             */
            "nTHead": null,

            /**
             * Permanent ref to the tfoot element - if it exists
             *  @type node
             *  @default null
             */
            "nTFoot": null,

            /**
             * Permanent ref to the tbody element
             *  @type node
             *  @default null
             */
            "nTBody": null,

            /**
             * Cache the wrapper node (contains all DataTables controlled elements)
             *  @type node
             *  @default null
             */
            "nTableWrapper": null,

            /**
             * Indicate if when using server-side processing the loading of data
             * should be deferred until the second draw.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type boolean
             *  @default false
             */
            "bDeferLoading": false,

            /**
             * Indicate if all required information has been read in
             *  @type boolean
             *  @default false
             */
            "bInitialised": false,

            /**
             * Information about open rows. Each object in the array has the parameters
             * 'nTr' and 'nParent'
             *  @type array
             *  @default []
             */
            "aoOpenRows": [],

            /**
             * Dictate the positioning of DataTables' control elements - see
             * {@link DataTable.model.oInit.sDom}.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type string
             *  @default null
             */
            "sDom": null,

            /**
             * Which type of pagination should be used.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type string
             *  @default two_button
             */
            "sPaginationType": "two_button",

            /**
             * The state duration (for `stateSave`) in seconds.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type int
             *  @default 0
             */
            "iStateDuration": 0,

            /**
             * Array of callback functions for state saving. Each array element is an
             * object with the following parameters:
             *   <ul>
             *     <li>function:fn - function to call. Takes two parameters, oSettings
             *       and the JSON string to save that has been thus far created. Returns
             *       a JSON string to be inserted into a json object
             *       (i.e. '"param": [ 0, 1, 2]')</li>
             *     <li>string:sName - name of callback</li>
             *   </ul>
             *  @type array
             *  @default []
             */
            "aoStateSave": [],

            /**
             * Array of callback functions for state loading. Each array element is an
             * object with the following parameters:
             *   <ul>
             *     <li>function:fn - function to call. Takes two parameters, oSettings
             *       and the object stored. May return false to cancel state loading</li>
             *     <li>string:sName - name of callback</li>
             *   </ul>
             *  @type array
             *  @default []
             */
            "aoStateLoad": [],

            /**
             * State that was loaded. Useful for back reference
             *  @type object
             *  @default null
             */
            "oLoadedState": null,

            /**
             * Source url for AJAX data for the table.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type string
             *  @default null
             */
            "sAjaxSource": null,

            /**
             * Property from a given object from which to read the table data from. This
             * can be an empty string (when not server-side processing), in which case
             * it is  assumed an an array is given directly.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type string
             */
            "sAjaxDataProp": null,

            /**
             * Note if draw should be blocked while getting data
             *  @type boolean
             *  @default true
             */
            "bAjaxDataGet": true,

            /**
             * The last jQuery XHR object that was used for server-side data gathering.
             * This can be used for working with the XHR information in one of the
             * callbacks
             *  @type object
             *  @default null
             */
            "jqXHR": null,

            /**
             * JSON returned from the server in the last Ajax request
             *  @type object
             *  @default undefined
             */
            "json": undefined,

            /**
             * Function to get the server-side data.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type function
             */
            "fnServerData": null,

            /**
             * Functions which are called prior to sending an Ajax request so extra
             * parameters can easily be sent to the server
             *  @type array
             *  @default []
             */
            "aoServerParams": [],

            /**
             * Send the XHR HTTP method - GET or POST (could be PUT or DELETE if
             * required).
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type string
             */
            "sServerMethod": null,

            /**
             * Format numbers for display.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type function
             */
            "fnFormatNumber": null,

            /**
             * List of options that can be used for the user selectable length menu.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type array
             *  @default []
             */
            "aLengthMenu": null,

            /**
             * Counter for the draws that the table does. Also used as a tracker for
             * server-side processing
             *  @type int
             *  @default 0
             */
            "iDraw": 0,

            /**
             * Indicate if a redraw is being done - useful for Ajax
             *  @type boolean
             *  @default false
             */
            "bDrawing": false,

            /**
             * Draw index (iDraw) of the last error when parsing the returned data
             *  @type int
             *  @default -1
             */
            "iDrawError": -1,

            /**
             * Paging display length
             *  @type int
             *  @default 10
             */
            "_iDisplayLength": 10,

            /**
             * Paging start point - aiDisplay index
             *  @type int
             *  @default 0
             */
            "_iDisplayStart": 0,

            /**
             * Server-side processing - number of records in the result set
             * (i.e. before filtering), Use fnRecordsTotal rather than
             * this property to get the value of the number of records, regardless of
             * the server-side processing setting.
             *  @type int
             *  @default 0
             *  @private
             */
            "_iRecordsTotal": 0,

            /**
             * Server-side processing - number of records in the current display set
             * (i.e. after filtering). Use fnRecordsDisplay rather than
             * this property to get the value of the number of records, regardless of
             * the server-side processing setting.
             *  @type boolean
             *  @default 0
             *  @private
             */
            "_iRecordsDisplay": 0,

            /**
             * Flag to indicate if jQuery UI marking and classes should be used.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type boolean
             */
            "bJUI": null,

            /**
             * The classes to use for the table
             *  @type object
             *  @default {}
             */
            "oClasses": {},

            /**
             * Flag attached to the settings object so you can check in the draw
             * callback if filtering has been done in the draw. Deprecated in favour of
             * events.
             *  @type boolean
             *  @default false
             *  @deprecated
             */
            "bFiltered": false,

            /**
             * Flag attached to the settings object so you can check in the draw
             * callback if sorting has been done in the draw. Deprecated in favour of
             * events.
             *  @type boolean
             *  @default false
             *  @deprecated
             */
            "bSorted": false,

            /**
             * Indicate that if multiple rows are in the header and there is more than
             * one unique cell per column, if the top one (true) or bottom one (false)
             * should be used for sorting / title by DataTables.
             * Note that this parameter will be set by the initialisation routine. To
             * set a default use {@link DataTable.defaults}.
             *  @type boolean
             */
            "bSortCellsTop": null,

            /**
             * Initialisation object that is used for the table
             *  @type object
             *  @default null
             */
            "oInit": null,

            /**
             * Destroy callback functions - for plug-ins to attach themselves to the
             * destroy so they can clean up markup and events.
             *  @type array
             *  @default []
             */
            "aoDestroyCallback": [],


            /**
             * Get the number of records in the current record set, before filtering
             *  @type function
             */
            "fnRecordsTotal": function () {
                return _fnDataSource(this) == 'ssp' ?
                    this._iRecordsTotal * 1 :
                    this.aiDisplayMaster.length;
            },

            /**
             * Get the number of records in the current record set, after filtering
             *  @type function
             */
            "fnRecordsDisplay": function () {
                return _fnDataSource(this) == 'ssp' ?
                    this._iRecordsDisplay * 1 :
                    this.aiDisplay.length;
            },

            /**
             * Get the display end point - aiDisplay index
             *  @type function
             */
            "fnDisplayEnd": function () {
                var
                    len = this._iDisplayLength,
                    start = this._iDisplayStart,
                    calc = start + len,
                    records = this.aiDisplay.length,
                    features = this.oFeatures,
                    paginate = features.bPaginate;

                if (features.bServerSide) {
                    return paginate === false || len === -1 ?
                        Math.min(start + len, this._iRecordsDisplay) : start + records; // axh 2017/7/3 edit
                }
                else {
                    return !paginate || calc > records || len === -1 ?
                        records :
                        calc;
                }
            },

            /**
             * The DataTables object for this table
             *  @type object
             *  @default null
             */
            "oInstance": null,

            /**
             * Unique identifier for each instance of the DataTables object. If there
             * is an ID on the table node, then it takes that value, otherwise an
             * incrementing internal counter is used.
             *  @type string
             *  @default null
             */
            "sInstance": null,

            /**
             * tabindex attribute value that is added to DataTables control elements, allowing
             * keyboard navigation of the table and its controls.
             */
            "iTabIndex": 0,

            /**
             * DIV container for the footer scrolling table if scrolling
             */
            "nScrollHead": null,

            /**
             * DIV container for the footer scrolling table if scrolling
             */
            "nScrollFoot": null,

            /**
             * Last applied sort
             *  @type array
             *  @default []
             */
            "aLastSort": [],

            /**
             * Stored plug-in instances
             *  @type object
             *  @default {}
             */
            "oPlugins": {}
        };

        /**
         * Extension object for DataTables that is used to provide all extension
         * options.
         *
         * Note that the `DataTable.ext` object is available through
         * `jQuery.fn.dataTable.ext` where it may be accessed and manipulated. It is
         * also aliased to `jQuery.fn.dataTableExt` for historic reasons.
         *  @namespace
         *  @extends DataTable.models.ext
         */


        /**
         * DataTables extensions
         *
         * This namespace acts as a collection area for plug-ins that can be used to
         * extend DataTables capabilities. Indeed many of the build in methods
         * use this method to provide their own capabilities (sorting methods for
         * example).
         *
         * Note that this namespace is aliased to `jQuery.fn.dataTableExt` for legacy
         * reasons
         *
         *  @namespace
         */
        DataTable.ext = _ext = {
            /**
             * Element class names
             *
             *  @type object
             *  @default {}
             */
            classes: {},


            /**
             * Error reporting.
             *
             * How should DataTables report an error. Can take the value 'alert' or
             * 'throw'
             *
             *  @type string
             *  @default alert
             */
            errMode: "alert",


            /**
             * Feature plug-ins.
             *
             * This is an array of objects which describe the feature plug-ins that are
             * available to DataTables. These feature plug-ins are then available for
             * use through the `dom` initialisation option.
             *
             * Each feature plug-in is described by an object which must have the
             * following properties:
             *
             * * `fnInit` - function that is used to initialise the plug-in,
             * * `cFeature` - a character so the feature can be enabled by the `dom`
             *   instillation option. This is case sensitive.
             *
             * The `fnInit` function has the following input parameters:
             *
             * 1. `{object}` DataTables settings object: see
             *    {@link DataTable.models.oSettings}
             *
             * And the following return is expected:
             *
             * * {node|null} The element which contains your feature. Note that the
             *   return may also be void if your plug-in does not require to inject any
             *   DOM elements into DataTables control (`dom`) - for example this might
             *   be useful when developing a plug-in which allows table control via
             *   keyboard entry
             *
             *  @type array
             *
             *  @example
             *    $.fn.dataTable.ext.features.push( {
		 *      "fnInit": function( oSettings ) {
		 *        return new TableTools( { "oDTSettings": oSettings } );
		 *      },
		 *      "cFeature": "T"
		 *    } );
             */
            feature: [],


            /**
             * Row searching.
             *
             * This method of searching is complimentary to the default type based
             * searching, and a lot more comprehensive as it allows you complete control
             * over the searching logic. Each element in this array is a function
             * (parameters described below) that is called for every row in the table,
             * and your logic decides if it should be included in the searching data set
             * or not.
             *
             * Searching functions have the following input parameters:
             *
             * 1. `{object}` DataTables settings object: see
             *    {@link DataTable.models.oSettings}
             * 2. `{array|object}` Data for the row to be processed (same as the
             *    original format that was passed in as the data source, or an array
             *    from a DOM data source
             * 3. `{int}` Row index ({@link DataTable.models.oSettings.aoData}), which
             *    can be useful to retrieve the `TR` element if you need DOM interaction.
             *
             * And the following return is expected:
             *
             * * {boolean} Include the row in the searched result set (true) or not
             *   (false)
             *
             * Note that as with the main search ability in DataTables, technically this
             * is "filtering", since it is subtractive. However, for consistency in
             * naming we call it searching here.
             *
             *  @type array
             *  @default []
             *
             *  @example
             *    // The following example shows custom search being applied to the
             *    // fourth column (i.e. the data[3] index) based on two input values
             *    // from the end-user, matching the data in a certain range.
             *    $.fn.dataTable.ext.search.push(
             *      function( settings, data, dataIndex ) {
		 *        var min = document.getElementById('min').value * 1;
		 *        var max = document.getElementById('max').value * 1;
		 *        var version = data[3] == "-" ? 0 : data[3]*1;
		 *
		 *        if ( min == "" && max == "" ) {
		 *          return true;
		 *        }
		 *        else if ( min == "" && version < max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && "" == max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && version < max ) {
		 *          return true;
		 *        }
		 *        return false;
		 *      }
             *    );
             */
            search: [],


            /**
             * Internal functions, exposed for used in plug-ins.
             *
             * Please note that you should not need to use the internal methods for
             * anything other than a plug-in (and even then, try to avoid if possible).
             * The internal function may change between releases.
             *
             *  @type object
             *  @default {}
             */
            internal: {},


            /**
             * Legacy configuration options. Enable and disable legacy options that
             * are available in DataTables.
             *
             *  @type object
             */
            legacy: {
                /**
                 * Enable / disable DataTables 1.9 compatible server-side processing
                 * requests
                 *
                 *  @type boolean
                 *  @default null
                 */
                ajax: null
            },


            /**
             * Pagination plug-in methods.
             *
             * Each entry in this object is a function and defines which buttons should
             * be shown by the pagination rendering method that is used for the table:
             * {@link DataTable.ext.renderer.pageButton}. The renderer addresses how the
             * buttons are displayed in the document, while the functions here tell it
             * what buttons to display. This is done by returning an array of button
             * descriptions (what each button will do).
             *
             * Pagination types (the four built in options and any additional plug-in
             * options defined here) can be used through the `paginationType`
             * initialisation parameter.
             *
             * The functions defined take two parameters:
             *
             * 1. `{int} page` The current page index
             * 2. `{int} pages` The number of pages in the table
             *
             * Each function is expected to return an array where each element of the
             * array can be one of:
             *
             * * `first` - Jump to first page when activated
             * * `last` - Jump to last page when activated
             * * `previous` - Show previous page when activated
             * * `next` - Show next page when activated
             * * `{int}` - Show page of the index given
             * * `{array}` - A nested array containing the above elements to add a
             *   containing 'DIV' element (might be useful for styling).
             *
             * Note that DataTables v1.9- used this object slightly differently whereby
             * an object with two functions would be defined for each plug-in. That
             * ability is still supported by DataTables 1.10+ to provide backwards
             * compatibility, but this option of use is now decremented and no longer
             * documented in DataTables 1.10+.
             *
             *  @type object
             *  @default {}
             *
             *  @example
             *    // Show previous, next and current page buttons only
             *    $.fn.dataTableExt.oPagination.current = function ( page, pages ) {
		 *      return [ 'previous', page, 'next' ];
		 *    };
             */
            pager: {},


            renderer: {
                pageButton: {},
                header: {}
            },


            /**
             * Ordering plug-ins - custom data source
             *
             * The extension options for ordering of data available here is complimentary
             * to the default type based ordering that DataTables typically uses. It
             * allows much greater control over the the data that is being used to
             * order a column, but is necessarily therefore more complex.
             *
             * This type of ordering is useful if you want to do ordering based on data
             * live from the DOM (for example the contents of an 'input' element) rather
             * than just the static string that DataTables knows of.
             *
             * The way these plug-ins work is that you create an array of the values you
             * wish to be ordering for the column in question and then return that
             * array. The data in the array much be in the index order of the rows in
             * the table (not the currently ordering order!). Which order data gathering
             * function is run here depends on the `dt-init columns.orderDataType`
             * parameter that is used for the column (if any).
             *
             * The functions defined take two parameters:
             *
             * 1. `{object}` DataTables settings object: see
             *    {@link DataTable.models.oSettings}
             * 2. `{int}` Target column index
             *
             * Each function is expected to return an array:
             *
             * * `{array}` Data for the column to be ordering upon
             *
             *  @type array
             *
             *  @example
             *    // Ordering using `input` node values
             *    $.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
             *    {
		 *      return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
		 *        return $('input', td).val();
		 *      } );
		 *    }
             */
            order: {},


            /**
             * Type based plug-ins.
             *
             * Each column in DataTables has a type assigned to it, either by automatic
             * detection or by direct assignment using the `type` option for the column.
             * The type of a column will effect how it is ordering and search (plug-ins
             * can also make use of the column type if required).
             *
             * @namespace
             */
            type: {
                /**
                 * Type detection functions.
                 *
                 * The functions defined in this object are used to automatically detect
                 * a column's type, making initialisation of DataTables super easy, even
                 * when complex data is in the table.
                 *
                 * The functions defined take two parameters:
                 *
                 *  1. `{*}` Data from the column cell to be analysed
                 *  2. `{settings}` DataTables settings object. This can be used to
                 *     perform context specific type detection - for example detection
                 *     based on language settings such as using a comma for a decimal
                 *     place. Generally speaking the options from the settings will not
                 *     be required
                 *
                 * Each function is expected to return:
                 *
                 * * `{string|null}` Data type detected, or null if unknown (and thus
                 *   pass it on to the other type detection functions.
                 *
                 *  @type array
                 *
                 *  @example
                 *    // Currency type detection plug-in:
                 *    $.fn.dataTable.ext.type.detect.push(
                 *      function ( data, settings ) {
			 *        // Check the numeric part
			 *        if ( ! $.isNumeric( data.substring(1) ) ) {
			 *          return null;
			 *        }
			 *
			 *        // Check prefixed by currency
			 *        if ( data.charAt(0) == '$' || data.charAt(0) == '&pound;' ) {
			 *          return 'currency';
			 *        }
			 *        return null;
			 *      }
                 *    );
                 */
                detect: [],


                /**
                 * Type based search formatting.
                 *
                 * The type based searching functions can be used to pre-format the
                 * data to be search on. For example, it can be used to strip HTML
                 * tags or to de-format telephone numbers for numeric only searching.
                 *
                 * Note that is a search is not defined for a column of a given type,
                 * no search formatting will be performed.
                 *
                 * Pre-processing of searching data plug-ins - When you assign the sType
                 * for a column (or have it automatically detected for you by DataTables
                 * or a type detection plug-in), you will typically be using this for
                 * custom sorting, but it can also be used to provide custom searching
                 * by allowing you to pre-processing the data and returning the data in
                 * the format that should be searched upon. This is done by adding
                 * functions this object with a parameter name which matches the sType
                 * for that target column. This is the corollary of <i>afnSortData</i>
                 * for searching data.
                 *
                 * The functions defined take a single parameter:
                 *
                 *  1. `{*}` Data from the column cell to be prepared for searching
                 *
                 * Each function is expected to return:
                 *
                 * * `{string|null}` Formatted string that will be used for the searching.
                 *
                 *  @type object
                 *  @default {}
                 *
                 *  @example
                 *    $.fn.dataTable.ext.type.search['title-numeric'] = function ( d ) {
			 *      return d.replace(/\n/g," ").replace( /<.*?>/g, "" );
			 *    }
                 */
                search: {},


                /**
                 * Type based ordering.
                 *
                 * The column type tells DataTables what ordering to apply to the table
                 * when a column is sorted upon. The order for each type that is defined,
                 * is defined by the functions available in this object.
                 *
                 * Each ordering option can be described by three properties added to
                 * this object:
                 *
                 * * `{type}-pre` - Pre-formatting function
                 * * `{type}-asc` - Ascending order function
                 * * `{type}-desc` - Descending order function
                 *
                 * All three can be used together, only `{type}-pre` or only
                 * `{type}-asc` and `{type}-desc` together. It is generally recommended
                 * that only `{type}-pre` is used, as this provides the optimal
                 * implementation in terms of speed, although the others are provided
                 * for compatibility with existing Javascript sort functions.
                 *
                 * `{type}-pre`: Functions defined take a single parameter:
                 *
                 *  1. `{*}` Data from the column cell to be prepared for ordering
                 *
                 * And return:
                 *
                 * * `{*}` Data to be sorted upon
                 *
                 * `{type}-asc` and `{type}-desc`: Functions are typical Javascript sort
                 * functions, taking two parameters:
                 *
                 *  1. `{*}` Data to compare to the second parameter
                 *  2. `{*}` Data to compare to the first parameter
                 *
                 * And returning:
                 *
                 * * `{*}` Ordering match: <0 if first parameter should be sorted lower
                 *   than the second parameter, ===0 if the two parameters are equal and
                 *   >0 if the first parameter should be sorted height than the second
                 *   parameter.
                 *
                 *  @type object
                 *  @default {}
                 *
                 *  @example
                 *    // Numeric ordering of formatted numbers with a pre-formatter
                 *    $.extend( $.fn.dataTable.ext.type.order, {
			 *      "string-pre": function(x) {
			 *        a = (a === "-" || a === "") ? 0 : a.replace( /[^\d\-\.]/g, "" );
			 *        return parseFloat( a );
			 *      }
			 *    } );
                 *
                 *  @example
                 *    // Case-sensitive string ordering, with no pre-formatting method
                 *    $.extend( $.fn.dataTable.ext.order, {
			 *      "string-case-asc": function(x,y) {
			 *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			 *      },
			 *      "string-case-desc": function(x,y) {
			 *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
			 *      }
			 *    } );
                 */
                order: {}
            },

            /**
             * Unique DataTables instance counter
             *
             * @type int
             * @private
             */
            _unique: 0,


            //
            // Depreciated
            // The following properties are retained for backwards compatiblity only.
            // The should not be used in new projects and will be removed in a future
            // version
            //

            /**
             * Version check function.
             *  @type function
             *  @depreciated Since 1.10
             */
            fnVersionCheck: DataTable.fnVersionCheck,


            /**
             * Index for what 'this' index API functions should use
             *  @type int
             *  @deprecated Since v1.10
             */
            iApiIndex: 0,


            /**
             * jQuery UI class container
             *  @type object
             *  @deprecated Since v1.10
             */
            oJUIClasses: {},


            /**
             * Software version
             *  @type string
             *  @deprecated Since v1.10
             */
            sVersion: DataTable.version
        };


        //
        // Backwards compatibility. Alias to pre 1.10 Hungarian notation counter parts
        //
        $.extend(_ext, {
            afnFiltering: _ext.search,
            aTypes: _ext.type.detect,
            ofnSearch: _ext.type.search,
            oSort: _ext.type.order,
            afnSortData: _ext.order,
            aoFeatures: _ext.feature,
            oApi: _ext.internal,
            oStdClasses: _ext.classes,
            oPagination: _ext.pager
        });


        $.extend(DataTable.ext.classes, {
            "sTable": "dataTable",
            "sNoFooter": "no-footer",

            /* Paging buttons */
            "sPageButton": "paginate_button",
            "sPageButtonActive": "current",
            "sPageButtonDisabled": "disabled",

            /* Striping classes */
            "sStripeOdd": "odd",
            "sStripeEven": "even",

            /* Empty row */
            "sRowEmpty": "dataTables_empty",

            /* Features */
            "sWrapper": "dataTables_wrapper",
            "sFilter": "dataTables_filter",
            "sInfo": "dataTables_info",
            "sPaging": "dataTables_paginate paging_", /* Note that the type is postfixed */
            "sLength": "dataTables_length",
            "sProcessing": "dataTables_processing",

            /* Sorting */
            "sSortAsc": "sorting_asc",
            "sSortDesc": "sorting_desc",
            "sSortable": "sorting", /* Sortable in both directions */
            "sSortableAsc": "sorting_asc_disabled",
            "sSortableDesc": "sorting_desc_disabled",
            "sSortableNone": "sorting_disabled",
            "sSortColumn": "sorting_", /* Note that an int is postfixed for the sorting order */

            /* Filtering */
            "sFilterInput": "",

            /* Page length */
            "sLengthSelect": "",

            /* Scrolling */
            "sScrollWrapper": "dataTables_scroll",
            "sScrollHead": "dataTables_scrollHead",
            "sScrollHeadInner": "dataTables_scrollHeadInner",
            "sScrollBody": "dataTables_scrollBody",
            "sScrollFoot": "dataTables_scrollFoot",
            "sScrollFootInner": "dataTables_scrollFootInner",

            /* Misc */
            "sHeaderTH": "",
            "sFooterTH": "",

            // Deprecated
            "sSortJUIAsc": "",
            "sSortJUIDesc": "",
            "sSortJUI": "",
            "sSortJUIAscAllowed": "",
            "sSortJUIDescAllowed": "",
            "sSortJUIWrapper": "",
            "sSortIcon": "",
            "sJUIHeader": "",
            "sJUIFooter": ""
        });


        (function () {

            // Reused strings for better compression. Closure compiler appears to have a
            // weird edge case where it is trying to expand strings rather than use the
            // variable version. This results in about 200 bytes being added, for very
            // little preference benefit since it this run on script load only.
            var _empty = '';
            _empty = '';

            var _stateDefault = _empty + 'ui-state-default';
            var _sortIcon = _empty + 'css_right ui-icon ui-icon-';
            var _headerFooter = _empty + 'fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix';

            $.extend(DataTable.ext.oJUIClasses, DataTable.ext.classes, {
                /* Full numbers paging buttons */
                "sPageButton": "fg-button ui-button " + _stateDefault,
                "sPageButtonActive": "ui-state-disabled",
                "sPageButtonDisabled": "ui-state-disabled",

                /* Features */
                "sPaging": "dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi " +
                "ui-buttonset-multi paging_", /* Note that the type is postfixed */

                /* Sorting */
                "sSortAsc": _stateDefault + " sorting_asc",
                "sSortDesc": _stateDefault + " sorting_desc",
                "sSortable": _stateDefault + " sorting",
                "sSortableAsc": _stateDefault + " sorting_asc_disabled",
                "sSortableDesc": _stateDefault + " sorting_desc_disabled",
                "sSortableNone": _stateDefault + " sorting_disabled",
                "sSortJUIAsc": _sortIcon + "triangle-1-n",
                "sSortJUIDesc": _sortIcon + "triangle-1-s",
                "sSortJUI": _sortIcon + "carat-2-n-s",
                "sSortJUIAscAllowed": _sortIcon + "carat-1-n",
                "sSortJUIDescAllowed": _sortIcon + "carat-1-s",
                "sSortJUIWrapper": "DataTables_sort_wrapper",
                "sSortIcon": "DataTables_sort_icon",

                /* Scrolling */
                "sScrollHead": "dataTables_scrollHead " + _stateDefault,
                "sScrollFoot": "dataTables_scrollFoot " + _stateDefault,

                /* Misc */
                "sHeaderTH": _stateDefault,
                "sFooterTH": _stateDefault,
                "sJUIHeader": _headerFooter + " ui-corner-tl ui-corner-tr",
                "sJUIFooter": _headerFooter + " ui-corner-bl ui-corner-br"
            });

        }());


        var extPagination = DataTable.ext.pager;

        function _numbers(page, pages) {
            var
                numbers = [],
                buttons = extPagination.numbers_length,
                half = Math.floor(buttons / 2),
                i = 1;

            if (pages <= buttons) {
                numbers = _range(0, pages);
            }
            else if (page <= half) {
                numbers = _range(0, buttons - 2);
                numbers.push('ellipsis');
                numbers.push(pages - 1);
            }
            else if (page >= pages - 1 - half) {
                numbers = _range(pages - (buttons - 2), pages);
                numbers.splice(0, 0, 'ellipsis'); // no unshift in ie6
                numbers.splice(0, 0, 0);
            }
            else {
                numbers = _range(page - 1, page + 2);
                numbers.push('ellipsis');
                numbers.push(pages - 1);
                numbers.splice(0, 0, 'ellipsis');
                numbers.splice(0, 0, 0);
            }

            numbers.DT_el = 'span';
            return numbers;
        }


        $.extend(extPagination, {
            simple: function (page, pages) {
                return ['previous', 'next'];
            },

            full: function (page, pages) {
                return ['first', 'previous', 'next', 'last'];
            },

            simple_numbers: function (page, pages) {
                return ['previous', _numbers(page, pages), 'next'];
            },

            full_numbers: function (page, pages) {
                return ['first', 'previous', _numbers(page, pages), 'next', 'last'];
            },

            // For testing and plug-ins to use
            _numbers: _numbers,
            numbers_length: 5
        });


        $.extend(true, DataTable.ext.renderer, {
            pageButton: {
                _: function (settings, host, idx, buttons, page, pages) {
                    var classes = settings.oClasses;
                    var lang = settings.oLanguage.oPaginate;
                    var btnDisplay, btnClass;

                    var attach = function (container, buttons) {
                        var i, ien, node, button;
                        var clickHandler = function (e) {
                            _fnPageChange(settings, e.data.action, true);
                        };

                        for (i = 0, ien = buttons.length; i < ien; i++) {
                            button = buttons[i];

                            if ($.isArray(button)) {
                                var inner = $('<' + (button.DT_el || 'div') + '/>')
                                    .appendTo(container);
                                attach(inner, button);
                            }
                            else {
                                btnDisplay = '';
                                btnClass = '';

                                switch (button) {
                                    case 'ellipsis':
                                        container.append('<span>&hellip;</span>');
                                        break;

                                    case 'first':
                                        btnDisplay = lang.sFirst;
                                        btnClass = button + (page > 0 ?
                                            '' : ' ' + classes.sPageButtonDisabled);
                                        break;

                                    case 'previous':
                                        btnDisplay = lang.sPrevious;
                                        btnClass = button + (page > 0 ?
                                            '' : ' ' + classes.sPageButtonDisabled);
                                        break;

                                    case 'next':
                                        btnDisplay = lang.sNext;
                                        btnClass = button + (page < pages - 1 ?
                                            '' : ' ' + classes.sPageButtonDisabled);
                                        break;

                                    case 'last':
                                        btnDisplay = lang.sLast;
                                        btnClass = button + (page < pages - 1 ?
                                            '' : ' ' + classes.sPageButtonDisabled);
                                        break;

                                    default:
                                        btnDisplay = button + 1;
                                        btnClass = page === button ?
                                            classes.sPageButtonActive : '';
                                        break;
                                }

                                if (btnDisplay) {
                                    node = $('<a>', {
                                        'class': classes.sPageButton + ' ' + btnClass,
                                        'aria-controls': settings.sTableId,
                                        'tabindex': settings.iTabIndex,
                                        'id': idx === 0 && typeof button === 'string' ?
                                            settings.sTableId + '_' + button :
                                            null
                                    })
                                        .html(btnDisplay)
                                        .appendTo(container);

                                    _fnBindAction(
                                        node, {action: button}, clickHandler
                                    );
                                }
                            }
                        }
                    };

                    attach($(host).empty(), buttons);
                }
            }
        });


        var __numericReplace = function (d, decimalPlace, re1, re2) {
            if (!d || d === '-') {
                return -Infinity;
            }

            // If a decimal place other than `.` is used, it needs to be given to the
            // function so we can detect it and replace with a `.` which is the only
            // decimal place Javascript recognises - it is not locale aware.
            if (decimalPlace) {
                d = _numToDecimal(d, decimalPlace);
            }

            if (d.replace) {
                if (re1) {
                    d = d.replace(re1, '');
                }

                if (re2) {
                    d = d.replace(re2, '');
                }
            }

            return d * 1;
        };


        // Add the numeric 'deformatting' functions for sorting. This is done in a
        // function to provide an easy ability for the language options to add
        // additional methods if a non-period decimal place is used.
        function _addNumericSort(decimalPlace) {
            $.each(
                {
                    // Plain numbers
                    "num": function (d) {
                        return __numericReplace(d, decimalPlace);
                    },

                    // Formatted numbers
                    "num-fmt": function (d) {
                        return __numericReplace(d, decimalPlace, _re_formatted_numeric);
                    },

                    // HTML numeric
                    "html-num": function (d) {
                        return __numericReplace(d, decimalPlace, _re_html);
                    },

                    // HTML numeric, formatted
                    "html-num-fmt": function (d) {
                        return __numericReplace(d, decimalPlace, _re_html, _re_formatted_numeric);
                    }
                },
                function (key, fn) {
                    _ext.type.order[key + decimalPlace + '-pre'] = fn;
                }
            );
        }


        // Default sort methods
        $.extend(_ext.type.order, {
            // Dates
            "date-pre": function (d) {
                return Date.parse(d) || 0;
            },

            // html
            "html-pre": function (a) {
                return a.replace ?
                    a.replace(/<.*?>/g, "").toLowerCase() :
                    a + '';
            },

            // string
            "string-pre": function (a) {
                return typeof a === 'string' ?
                    a.toLowerCase() :
                    !a || !a.toString ?
                        '' :
                        a.toString();
            },

            // string-asc and -desc are retained only for compatibility with the old
            // sort methods
            "string-asc": function (x, y) {
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            },

            "string-desc": function (x, y) {
                return ((x < y) ? 1 : ((x > y) ? -1 : 0));
            }
        });


        // Numeric sorting types - order doesn't matter here
        _addNumericSort('');


        // Built in type detection. See model.ext.aTypes for information about
        // what is required from this methods.
        $.extend(DataTable.ext.type.detect, [
            // Plain numbers - first since V8 detects some plain numbers as dates
            // e.g. Date.parse('55') (but not all, e.g. Date.parse('22')...).
            function (d, settings) {
                var decimal = settings.oLanguage.sDecimal;
                return _isNumber(d, decimal) ? 'num' + decimal : null;
            },

            // Dates (only those recognised by the browser's Date.parse)
            function (d, settings) {
                // V8 will remove any unknown characters at the start of the expression,
                // leading to false matches such as `$245.12` being a valid date. See
                // forum thread 18941 for detail.
                if (d && !_re_date_start.test(d)) {
                    return null;
                }
                var parsed = Date.parse(d);
                return (parsed !== null && !isNaN(parsed)) || _empty(d) ? 'date' : null;
            },

            // Formatted numbers
            function (d, settings) {
                var decimal = settings.oLanguage.sDecimal;
                return _isNumber(d, decimal, true) ? 'num-fmt' + decimal : null;
            },

            // HTML numeric
            function (d, settings) {
                var decimal = settings.oLanguage.sDecimal;
                return _htmlNumeric(d, decimal) ? 'html-num' + decimal : null;
            },

            // HTML numeric, formatted
            function (d, settings) {
                var decimal = settings.oLanguage.sDecimal;
                return _htmlNumeric(d, decimal, true) ? 'html-num-fmt' + decimal : null;
            },

            // HTML (this is strict checking - there must be html)
            function (d, settings) {
                return _empty(d) || (typeof d === 'string' && d.indexOf('<') !== -1) ?
                    'html' : null;
            }
        ]);


        // Filter formatting functions. See model.ext.ofnSearch for information about
        // what is required from these methods.


        $.extend(DataTable.ext.type.search, {
            html: function (data) {
                return _empty(data) ?
                    '' :
                    typeof data === 'string' ?
                        data
                            .replace(_re_new_lines, " ")
                            .replace(_re_html, "") :
                        '';
            },

            string: function (data) {
                return _empty(data) ?
                    '' :
                    typeof data === 'string' ?
                        data.replace(_re_new_lines, " ") :
                        data;
            }
        });


        $.extend(true, DataTable.ext.renderer, {
            header: {
                _: function (settings, cell, column, classes) {
                    // No additional mark-up required
                    // Attach a sort listener to update on sort
                    $(settings.nTable).on('order.dt', function (e, settings, sorting, columns) {
                        var colIdx = column.idx;

                        cell
                            .removeClass(
                                column.sSortingClass + ' ' +
                                classes.sSortAsc + ' ' +
                                classes.sSortDesc
                            )
                            .addClass(columns[colIdx] == 'asc' ?
                                classes.sSortAsc : columns[colIdx] == 'desc' ?
                                    classes.sSortDesc :
                                    column.sSortingClass
                            );
                    });
                },

                jqueryui: function (settings, cell, column, classes) {
                    var colIdx = column.idx;

                    $('<div/>')
                        .addClass(classes.sSortJUIWrapper)
                        .append(cell.contents())
                        .append($('<span/>')
                            .addClass(classes.sSortIcon + ' ' + column.sSortingClassJUI)
                        )
                        .appendTo(cell);

                    // Attach a sort listener to update on sort
                    $(settings.nTable).on('order.dt', function (e, settings, sorting, columns) {
                        cell
                            .removeClass(classes.sSortAsc + " " + classes.sSortDesc)
                            .addClass(columns[colIdx] == 'asc' ?
                                classes.sSortAsc : columns[colIdx] == 'desc' ?
                                    classes.sSortDesc :
                                    column.sSortingClass
                            );

                        cell
                            .find('span')
                            .removeClass(
                                classes.sSortJUIAsc + " " +
                                classes.sSortJUIDesc + " " +
                                classes.sSortJUI + " " +
                                classes.sSortJUIAscAllowed + " " +
                                classes.sSortJUIDescAllowed
                            )
                            .addClass(columns[colIdx] == 'asc' ?
                                classes.sSortJUIAsc : columns[colIdx] == 'desc' ?
                                    classes.sSortJUIDesc :
                                    column.sSortingClassJUI
                            );
                    });
                }
            }
        });


        /*
	 * This is really a good bit rubbish this method of exposing the internal methods
	 * publicly... - To be fixed in 2.0 using methods on the prototype
	 */


        /**
         * Create a wrapper function for exporting an internal functions to an external API.
         *  @param {string} fn API function name
         *  @returns {function} wrapped function
         *  @memberof DataTable#internal
         */
        function _fnExternApiFunc(fn) {
            return function () {
                var args = [_fnSettingsFromNode(this[DataTable.ext.iApiIndex])].concat(
                    Array.prototype.slice.call(arguments)
                );
                return DataTable.ext.internal[fn].apply(this, args);
            };
        }


        /**
         * Reference to internal functions for use by plug-in developers. Note that
         * these methods are references to internal functions and are considered to be
         * private. If you use these methods, be aware that they are liable to change
         * between versions.
         *  @namespace
         */
        $.extend(DataTable.ext.internal, {
            _fnExternApiFunc: _fnExternApiFunc,
            _fnBuildAjax: _fnBuildAjax,
            _fnAjaxUpdate: _fnAjaxUpdate,
            _fnAjaxParameters: _fnAjaxParameters,
            _fnAjaxUpdateDraw: _fnAjaxUpdateDraw,
            _fnAjaxDataSrc: _fnAjaxDataSrc,
            _fnAddColumn: _fnAddColumn,
            _fnColumnOptions: _fnColumnOptions,
            _fnAdjustColumnSizing: _fnAdjustColumnSizing,
            _fnVisibleToColumnIndex: _fnVisibleToColumnIndex,
            _fnColumnIndexToVisible: _fnColumnIndexToVisible,
            _fnVisbleColumns: _fnVisbleColumns,
            _fnGetColumns: _fnGetColumns,
            _fnColumnTypes: _fnColumnTypes,
            _fnApplyColumnDefs: _fnApplyColumnDefs,
            _fnHungarianMap: _fnHungarianMap,
            _fnCamelToHungarian: _fnCamelToHungarian,
            _fnLanguageCompat: _fnLanguageCompat,
            _fnBrowserDetect: _fnBrowserDetect,
            _fnAddData: _fnAddData,
            _fnAddTr: _fnAddTr,
            _fnNodeToDataIndex: _fnNodeToDataIndex,
            _fnNodeToColumnIndex: _fnNodeToColumnIndex,
            _fnGetRowData: _fnGetRowData,
            _fnGetCellData: _fnGetCellData,
            _fnSetCellData: _fnSetCellData,
            _fnSplitObjNotation: _fnSplitObjNotation,
            _fnGetObjectDataFn: _fnGetObjectDataFn,
            _fnSetObjectDataFn: _fnSetObjectDataFn,
            _fnGetDataMaster: _fnGetDataMaster,
            _fnClearTable: _fnClearTable,
            _fnDeleteIndex: _fnDeleteIndex,
            _fnInvalidateRow: _fnInvalidateRow,
            _fnGetRowElements: _fnGetRowElements,
            _fnCreateTr: _fnCreateTr,
            _fnBuildHead: _fnBuildHead,
            _fnDrawHead: _fnDrawHead,
            _fnDraw: _fnDraw,
            _fnReDraw: _fnReDraw,
            _fnAddOptionsHtml: _fnAddOptionsHtml,
            _fnDetectHeader: _fnDetectHeader,
            _fnGetUniqueThs: _fnGetUniqueThs,
            _fnFeatureHtmlFilter: _fnFeatureHtmlFilter,
            _fnFilterComplete: _fnFilterComplete,
            _fnFilterCustom: _fnFilterCustom,
            _fnFilterColumn: _fnFilterColumn,
            _fnFilter: _fnFilter,
            _fnFilterCreateSearch: _fnFilterCreateSearch,
            _fnEscapeRegex: _fnEscapeRegex,
            _fnFilterData: _fnFilterData,
            _fnFeatureHtmlInfo: _fnFeatureHtmlInfo,
            _fnUpdateInfo: _fnUpdateInfo,
            _fnInfoMacros: _fnInfoMacros,
            _fnInitialise: _fnInitialise,
            _fnInitComplete: _fnInitComplete,
            _fnLengthChange: _fnLengthChange,
            _fnFeatureHtmlLength: _fnFeatureHtmlLength,
            _fnFeatureHtmlPaginate: _fnFeatureHtmlPaginate,
            _fnPageChange: _fnPageChange,
            _fnFeatureHtmlProcessing: _fnFeatureHtmlProcessing,
            _fnProcessingDisplay: _fnProcessingDisplay,
            _fnFeatureHtmlTable: _fnFeatureHtmlTable,
            _fnScrollDraw: _fnScrollDraw,
            _fnApplyToChildren: _fnApplyToChildren,
            _fnCalculateColumnWidths: _fnCalculateColumnWidths,
            _fnThrottle: _fnThrottle,
            _fnConvertToWidth: _fnConvertToWidth,
            _fnScrollingWidthAdjust: _fnScrollingWidthAdjust,
            _fnGetWidestNode: _fnGetWidestNode,
            _fnGetMaxLenString: _fnGetMaxLenString,
            _fnStringToCss: _fnStringToCss,
            _fnScrollBarWidth: _fnScrollBarWidth,
            _fnSortFlatten: _fnSortFlatten,
            _fnSort: _fnSort,
            _fnSortAria: _fnSortAria,
            _fnSortListener: _fnSortListener,
            _fnSortAttachListener: _fnSortAttachListener,
            _fnSortingClasses: _fnSortingClasses,
            _fnSortData: _fnSortData,
            _fnSaveState: _fnSaveState,
            _fnLoadState: _fnLoadState,
            _fnSettingsFromNode: _fnSettingsFromNode,
            _fnLog: _fnLog,
            _fnMap: _fnMap,
            _fnBindAction: _fnBindAction,
            _fnCallbackReg: _fnCallbackReg,
            _fnCallbackFire: _fnCallbackFire,
            _fnLengthOverflow: _fnLengthOverflow,
            _fnRenderer: _fnRenderer,
            _fnDataSource: _fnDataSource,
            _fnRowAttributes: _fnRowAttributes,
            _fnCalculateEnd: function () {
            } // Used by a lot of plug-ins, but redundant
              // in 1.10, so this dead-end function is
              // added to prevent errors
        });


        // jQuery access
        $.fn.dataTable = DataTable;

        // Legacy aliases
        $.fn.dataTableSettings = DataTable.settings;
        $.fn.dataTableExt = DataTable.ext;

        // With a capital `D` we return a DataTables API instance rather than a
        // jQuery object
        $.fn.DataTable = function (opts) {
            var data = opts.data;
            if (data == undefined) {
                data = [];
            }
            ;
            if (data.length == 0) {
                opts.autoWidth = false;
                opts.bAutoWidth = false;
            } else {
                opts.autoWidth = true;
                opts.bAutoWidth = true;
            }
            ;
            return $(this).dataTable(opts).api();
        };

        // All properties that are available to $.fn.dataTable should also be
        // available on $.fn.DataTable
        $.each(DataTable, function (prop, val) {
            $.fn.DataTable[prop] = val;
        });


        // Information about events fired by DataTables - for documentation.
        /**
         * Draw event, fired whenever the table is redrawn on the page, at the same
         * point as fnDrawCallback. This may be useful for binding events or
         * performing calculations when the table is altered at all.
         *  @name DataTable#draw.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         */

        /**
         * Search event, fired when the searching applied to the table (using the
         * built-in global search, or column filters) is altered.
         *  @name DataTable#search.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         */

        /**
         * Page change event, fired when the paging of the table is altered.
         *  @name DataTable#page.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         */

        /**
         * Order event, fired when the ordering applied to the table is altered.
         *  @name DataTable#order.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         */

        /**
         * DataTables initialisation complete event, fired when the table is fully
         * drawn, including Ajax data loaded, if Ajax data is required.
         *  @name DataTable#init.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} oSettings DataTables settings object
         *  @param {object} json The JSON object request from the server - only
         *    present if client-side Ajax sourced data is used</li></ol>
         */

        /**
         * State save event, fired when the table has changed state a new state save
         * is required. This event allows modification of the state saving object
         * prior to actually doing the save, including addition or other state
         * properties (for plug-ins) or modification of a DataTables core property.
         *  @name DataTable#stateSaveParams.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} oSettings DataTables settings object
         *  @param {object} json The state information to be saved
         */

        /**
         * State load event, fired when the table is loading state from the stored
         * data, but prior to the settings object being modified by the saved state
         * - allowing modification of the saved state is required or loading of
         * state for a plug-in.
         *  @name DataTable#stateLoadParams.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} oSettings DataTables settings object
         *  @param {object} json The saved state information
         */

        /**
         * State loaded event, fired when state has been loaded from stored data and
         * the settings object has been modified by the loaded data.
         *  @name DataTable#stateLoaded.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} oSettings DataTables settings object
         *  @param {object} json The saved state information
         */

        /**
         * Processing event, fired when DataTables is doing some kind of processing
         * (be it, order, searcg or anything else). It can be used to indicate to
         * the end user that there is something happening, or that something has
         * finished.
         *  @name DataTable#processing.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} oSettings DataTables settings object
         *  @param {boolean} bShow Flag for if DataTables is doing processing or not
         */

        /**
         * Ajax (XHR) event, fired whenever an Ajax request is completed from a
         * request to made to the server for new data. This event is called before
         * DataTables processed the returned data, so it can also be used to pre-
         * process the data returned from the server, if needed.
         *
         * Note that this trigger is called in `fnServerData`, if you override
         * `fnServerData` and which to use this event, you need to trigger it in you
         * success function.
         *  @name DataTable#xhr.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         *  @param {object} json JSON returned from the server
         *
         *  @example
         *     // Use a custom property returned from the server in another DOM element
         *     $('#table').dataTable().on('xhr.dt', function (e, settings, json) {
	 *       $('#status').html( json.status );
	 *     } );
         *
         *  @example
         *     // Pre-process the data returned from the server
         *     $('#table').dataTable().on('xhr.dt', function (e, settings, json) {
	 *       for ( var i=0, ien=json.aaData.length ; i<ien ; i++ ) {
	 *         json.aaData[i].sum = json.aaData[i].one + json.aaData[i].two;
	 *       }
	 *       // Note no return - manipulate the data directly in the JSON object.
	 *     } );
         */

        /**
         * Destroy event, fired when the DataTable is destroyed by calling fnDestroy
         * or passing the bDestroy:true parameter in the initialisation object. This
         * can be used to remove bound events, added DOM nodes, etc.
         *  @name DataTable#destroy.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         */

        /**
         * Page length change event, fired when number of records to show on each
         * page (the length) is changed.
         *  @name DataTable#length.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         *  @param {integer} len New length
         */

        /**
         * Column sizing has changed.
         *  @name DataTable#column-sizing.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         */

        /**
         * Column visibility has changed.
         *  @name DataTable#column-visibility.dt
         *  @event
         *  @param {event} e jQuery event object
         *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
         *  @param {int} column Column index
         *  @param {bool} vis `false` if column now hidden, or `true` if visible
         */

        return $.fn.dataTable;
    }));

}(window, document));

$(function () {
	 //显示隐藏列
    var $keepOpen = $('.keep-open');
    $keepOpen.find('input').attr("checked",true);
    $keepOpen.find('li').off('click').on('click', function (event) {
         event.stopImmediatePropagation();
     });
          
    })

// dataTables列表分页

//In 1.10 we use the pagination renderers to draw the Bootstrap paging,
//rather than  custom plug-in
if ( $.fn.dataTable.Api ) {
	$.fn.dataTable.defaults.renderer = 'bootstrap';
	$.fn.dataTable.ext.renderer.pageButton.bootstrap = function ( settings, host, idx, buttons, page, pages ) {
		var api = new $.fn.dataTable.Api( settings );
		var classes = settings.oClasses;
		var lang = settings.oLanguage.oPaginate;
		var btnDisplay, btnClass;

		var attach = function( container, buttons ) {
			var i, ien, node, button;
			var clickHandler = function ( e ) {
				e.preventDefault();
				if ( e.data.action !== 'ellipsis' ) {
					api.page( e.data.action ).draw( false );
				}
			};

			for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
				button = buttons[i];

				if ( $.isArray( button ) ) {
					attach( container, button );
				}
				else {
					btnDisplay = '';
					btnClass = '';

					switch ( button ) {
						case 'ellipsis':
							btnDisplay = '&hellip;';
							btnClass = 'disabled';
							break;

						case 'first':
							btnDisplay = lang.sFirst;
							btnClass = button + (page > 0 ?
								'' : ' disabled');
							break;

						case 'previous':
							btnDisplay = lang.sPrevious;
							btnClass = button + (page > 0 ?
								'' : ' disabled');
							break;

						case 'next':
							btnDisplay = lang.sNext;
							btnClass = button + (page < pages-1 ?
								'' : ' disabled');
							break;

						case 'last':
							btnDisplay = lang.sLast;
							btnClass = button + (page < pages-1 ?
								'' : ' disabled');
							break;

						default:
							btnDisplay = button + 1;
							btnClass = page === button ?
								'active' : '';
							break;
					}

					if ( btnDisplay ) {
						node = $('<li>', {
								'class': classes.sPageButton+' '+btnClass,
								'aria-controls': settings.sTableId,
								'tabindex': settings.iTabIndex,
								'id': idx === 0 && typeof button === 'string' ?
									settings.sTableId +'_'+ button :
									null
							} )
							.append( $('<a>', {
									'href': '#'
								} )
								.html( btnDisplay )
							)
							.appendTo( container );

						settings.oApi._fnBindAction(
							node, {action: button}, clickHandler
						);
					}
				}
			}
		};

		attach(
			$(host).empty().html('<ul class="pagination"/>').children('ul'),
			buttons
		);
	}
}
else {
	// Integration for 1.9-
	$.fn.dataTable.defaults.sPaginationType = 'bootstrap';

	/* API method to get paging information */
	$.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings )
	{
		return {
			"iStart":         oSettings._iDisplayStart,
			"iEnd":           oSettings.fnDisplayEnd(),
			"iLength":        oSettings._iDisplayLength,
			"iTotal":         oSettings.fnRecordsTotal(),
			"iFilteredTotal": oSettings.fnRecordsDisplay(),
			"iPage":          oSettings._iDisplayLength === -1 ?
				0 : Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
			"iTotalPages":    oSettings._iDisplayLength === -1 ?
				0 : Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
		};
	};

	/* Bootstrap style pagination control */
	$.extend( $.fn.dataTableExt.oPagination, {
		"bootstrap": {
			"fnInit": function( oSettings, nPaging, fnDraw ) {
				var oLang = oSettings.oLanguage.oPaginate;
				var fnClickHandler = function ( e ) {
					e.preventDefault();
					if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
						fnDraw( oSettings );
					}
				};

				$(nPaging).append(
					'<ul class="pagination">'+
						'<li class="prev disabled"><a href="#">&larr; '+oLang.sPrevious+'</a></li>'+
						'<li class="next disabled"><a href="#">'+oLang.sNext+' &rarr; </a></li>'+
					'</ul>'
				);
				var els = $('a', nPaging);
				$(els[0]).bind( 'click.DT', { action: "previous" }, fnClickHandler );
				$(els[1]).bind( 'click.DT', { action: "next" }, fnClickHandler );
			},

			"fnUpdate": function ( oSettings, fnDraw ) {
				var iListLength = 5;
				var oPaging = oSettings.oInstance.fnPagingInfo();
				var an = oSettings.aanFeatures.p;
				var i, ien, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);

				if ( oPaging.iTotalPages < iListLength) {
					iStart = 1;
					iEnd = oPaging.iTotalPages;
				}
				else if ( oPaging.iPage <= iHalf ) {
					iStart = 1;
					iEnd = iListLength;
				} else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
					iStart = oPaging.iTotalPages - iListLength + 1;
					iEnd = oPaging.iTotalPages;
				} else {
					iStart = oPaging.iPage - iHalf + 1;
					iEnd = iStart + iListLength - 1;
				}

				for ( i=0, ien=an.length ; i<ien ; i++ ) {
					// Remove the middle elements
					$('li:gt(0)', an[i]).filter(':not(:last)').remove();

					// Add the new list items and their event handlers
					for ( j=iStart ; j<=iEnd ; j++ ) {
						sClass = (j==oPaging.iPage+1) ? 'class="active"' : '';
						$('<li '+sClass+'><a href="#">'+j+'</a></li>')
							.insertBefore( $('li:last', an[i])[0] )
							.bind('click', function (e) {
								e.preventDefault();
								oSettings._iDisplayStart = (parseInt($('a', this).text(),10)-1) * oPaging.iLength;
								fnDraw( oSettings );
							} );
					}

					// Add / remove disabled classes from the static elements
					if ( oPaging.iPage === 0 ) {
						$('li:first', an[i]).addClass('disabled');
					} else {
						$('li:first', an[i]).removeClass('disabled');
					}

					if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
						$('li:last', an[i]).addClass('disabled');
					} else {
						$('li:last', an[i]).removeClass('disabled');
					}
				}
			}
		}
	} );
}


/*
* TableTools Bootstrap compatibility
* Required TableTools 2.1+
*/
if ( $.fn.DataTable.TableTools ) {
	// Set the classes that TableTools uses to something suitable for Bootstrap
	$.extend( true, $.fn.DataTable.TableTools.classes, {
		"container": "DTTT btn-group",
		"buttons": {
			"normal": "btn btn-default",
			"disabled": "disabled"
		},
		"collection": {
			"container": "DTTT_dropdown dropdown-menu",
			"buttons": {
				"normal": "",
				"disabled": "disabled"
			}
		},
		"print": {
			"info": "DTTT_print_info modal"
		},
		"select": {
			"row": "active"
		}
	} );

	// Have the collection use a bootstrap compatible dropdown
	$.extend( true, $.fn.DataTable.TableTools.DEFAULTS.oTags, {
		"collection": {
			"container": "ul",
			"button": "li",
			"liner": "a"
		}
	} );
}
/**
 * Created by Administrator on 2016/7/26.
 */
$(function(){
    // 判断整数value是否等于0 
    jQuery.validator.addMethod("isIntEqZero", function(value, element) {
    	if(/^[-\+]?\d+$/.test(value)){
	        value=parseInt(value);
	        return this.optional(element) || value==0;
    	}else{
    		return false;
    	}
    }, "整数必须为0");

    // 判断整数value是否大于0
    jQuery.validator.addMethod("isIntGtZero", function(value, element) {
    	if(/^[-\+]?\d+$/.test(value)){
	        value=parseInt(value);
	        return this.optional(element) || value>0;
    	}else{
    		return false;
    	}
    }, "整数必须大于0");

    //验证组织机构代码格式
    jQuery.validator.addMethod("doubles",function(value,element){
        if(value.length == 9){
            var reg= /^[0-9]/;
            return this.optional(element)||(reg.test(value));
        } else if (value.length == 18) {
            var reg= /^([A-Z]*\d+[A-Z]+)|(\d*[A-Z]+\d+)$/;
            return this.optional(element)||(reg.test(value));
        } else if(value.length == 0){
            return true;
        } else {
            return false;
        }
    },"请输入正确的组织结构代码(9位数字)或者18位的统一社会信用代码(数字和大写字母的组合)");
    
    //验证输入的文本是否为数字和字母
    jQuery.validator.addMethod("isRegisterNumber",function(value,element){
    	var reg = /^[a-zA-Z0-9-]{13}-[a-zA-Z0-9]/;
    	return this.optional(element) || (reg.test(value));
    },"请输入正确的数字和字母以及正确的长度");
    

    // 判断是否是正确的数字
    jQuery.validator.addMethod("isRightNumber", function(value, element) {
    	var reg = /^[1-9]([0-9]*)$|^[0-9]$/;
        return this.optional(element) || reg.test(value);
    }, "请输入正确的数字");

    // 判断整数value是否大于或等于0
    jQuery.validator.addMethod("isIntGteZero", function(value, element) {
    	if(/^[-\+]?\d+$/.test(value)){
	        value=parseInt(value);
	        return this.optional(element) || value>=0;
    	}else{
    		return false;
    	}
    }, "整数必须大于或等于0");
    
    // 判断整数value是否介于1-120
    jQuery.validator.addMethod("isInt1to120", function(value, element) {
    	if(/^[-\+]?\d+$/.test(value)){
    		value=parseInt(value);
    		return this.optional(element) || (value >= 1 && value <= 120);
    	}else{
    		return false;
    	}
    }, "介于1到120之间的整数");
    
    // 判断整数value是否介于1-400
    jQuery.validator.addMethod("isInt1to400", function(value, element) {
    	if(/^[-\+]?\d+$/.test(value)){
    		value=parseInt(value);
    		return this.optional(element) || (value >= 1 && value <= 400);
    	}else{
    		return false;
    	}
    }, "介于1到400之间的整数");

    // 判断整数value是否介于1tovalue
    jQuery.validator.addMethod("isInt1tov", function(value, element,param) {
    	if(/^[-\+]?\d+$/.test(value)){
	        value=parseInt(value);
	        return this.optional(element) || (value >= 1 && value <= param);
    	}else if(value==null||value==""){
    		return true;
    	}else {
    	    return false;
        }
    }, "介于1到之间的整数");

    // 判断整数value是否介于1-60
    jQuery.validator.addMethod("isInt1to60", function(value, element) {
    	if(/^[-\+]?\d+$/.test(value)){
	        value=parseInt(value);
	        return this.optional(element) || (value >=1 && value <= 60);
    	}else{
    		return false;
    	}
    }, "介于1到60之间的整数");
    
    // 判断整数value是否介于10-100
    jQuery.validator.addMethod("isInt10to100", function(value, element) {
    	if(/^[-\+]?\d+$/.test(value)){
	        value=parseInt(value);
	        return this.optional(element) || (value >=10 && value <= 100);
    	}else{
        	return false;
        }
    }, "介于10到100之间的整数");
    
    // 判断整数value是否介于1-10
    jQuery.validator.addMethod("isInt1to10", function(value, element) {
    	if(/^[-\+]?\d+$/.test(value)){
	    	value=parseInt(value);
	        return this.optional(element) || (value >=1 && value <= 10);
    	}else{
    		return false;
    	}
    }, "介于1到10之间的整数");

    // 判断整数value是否介于1-24
    jQuery.validator.addMethod("isInt1to24", function(value, element) {
        if(/^[-\+]?\d/.test(value)){
            value=parseInt(value);
            return this.optional(element) || (value >=1 && value <= 24);
        }else{
            return false;
        }
    }, "介于1到24之间的整数");

    // 判断整数value是否介于0-59
    jQuery.validator.addMethod("isInt1to59", function(value, element) {
        if(/^[-\+]?\d/.test(value)){
            value=parseInt(value);
            return this.optional(element) || (value >=0 && value <= 59);
        }else{
            return false;
        }
    }, "介于0到59之间的整数");
    /*// 判断整数value是否介于1-10
    jQuery.validator.addMethod("isInt7to15", function(value, element) {
        if(/^[-\+]?\d+$/.test(value)){
            value=parseInt(value);
            console.log(value);
            return this.optional(element) || (value >=7 && value <= 15);
        }else{
            return false;
        }
    }, "介于7到15之间的整数");
*/
    // 判断整数value是否不等于0 
    jQuery.validator.addMethod("isIntNEqZero", function(value, element) {
    	if(/^[-\+]?\d+$/.test(value)){
	        value=parseInt(value);
	        return this.optional(element) || value!=0;
    	}else{
    		return false;
    	}
    }, "整数必须不等于0");

    // 判断整数value是否小于0 
    jQuery.validator.addMethod("isIntLtZero", function(value, element) {
    	if(/^[-\+]?\d+$/.test(value)){
	        value=parseInt(value);
	        return this.optional(element) || value<0;
    	}else{
    		return false;
    	}
    }, "整数必须小于0");

    // 判断整数value是否小于或等于0 
    jQuery.validator.addMethod("isIntLteZero", function(value, element) {
    	if(/^[-\+]?\d+$/.test(value)){
	        value=parseInt(value);
	        return this.optional(element) || value<=0;
    	}else{
    		return false;
    	}
    }, "整数必须小于或等于0");

    // 判断浮点数value是否等于0 
    jQuery.validator.addMethod("isFloatEqZero", function(value, element) {
        value=parseFloat(value);
        return this.optional(element) || value==0;
    }, "浮点数必须为0");

    // 判断浮点数value是否大于0
    jQuery.validator.addMethod("isFloatGtZero", function(value, element) {
        value=parseFloat(value);
        return this.optional(element) || value>0;
    }, "浮点数必须大于0");

    // 判断浮点数value是否大于或等于0
    jQuery.validator.addMethod("isFloatGteZero", function(value, element) {
        value=parseFloat(value);
        return this.optional(element) || value>=0;
    }, "浮点数必须大于或等于0");

    // 判断浮点数value是否不等于0 
    jQuery.validator.addMethod("isFloatNEqZero", function(value, element) {
        value=parseFloat(value);
        return this.optional(element) || value!=0;
    }, "浮点数必须不等于0");

    // 判断浮点数value是否小于0 
    jQuery.validator.addMethod("isFloatLtZero", function(value, element) {
        value=parseFloat(value);
        return this.optional(element) || value<0;
    }, "浮点数必须小于0");

    // 判断浮点数value是否小于或等于0 
    jQuery.validator.addMethod("isFloatLteZero", function(value, element) {
        value=parseFloat(value);
        return this.optional(element) || value<=0;
    }, "浮点数必须小于或等于0");

    // 判断浮点型  
    jQuery.validator.addMethod("isFloat", function(value, element) {
        return this.optional(element) || /^[-\+]?\d+(\.\d+)?$/.test(value);
    }, "只能包含数字、小数点等字符");
    
    // 判断小数0-1
    jQuery.validator.addMethod("isDecimal", function(value, element) {
        return this.optional(element) || /^0\.\d+$/.test(value);
    }, "只能输入0-1的小数");

    // 匹配integer
    jQuery.validator.addMethod("isInteger", function(value, element) {
        return this.optional(element) || (/^[-\+]?\d+$/.test(value) && parseInt(value)>=0);
    }, "匹配integer");

    // 判断数值类型，包括整数和浮点数
    jQuery.validator.addMethod("isNumber", function(value, element) {
        return this.optional(element) || /^[-\+]?\d+$/.test(value) || /^[-\+]?\d+(\.\d+)?$/.test(value);
    }, "匹配数值类型，包括整数和浮点数");

    // 只能输入[0-9]数字
    jQuery.validator.addMethod("isDigits", function(value, element) {
        return this.optional(element) || /^\d+$/.test(value);
    }, "只能输入0-9数字");

    // 判断中文字符 
    jQuery.validator.addMethod("isChinese", function(value, element) {
        return this.optional(element) || /^[\u0391-\uFFE5]+$/.test(value);
    }, "只能包含中文字符。");

    // 判断英文字符 
    jQuery.validator.addMethod("isEnglish", function(value, element) {
        return this.optional(element) || /^[A-Za-z]+$/.test(value);
    }, "只能包含英文字符。");

    // 手机号码验证    
    jQuery.validator.addMethod("isMobile", function(value, element) {
        var length = value.length;
        return this.optional(element) || (length == 11 && /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(value));
    }, "请正确填写您的手机号码。");

    // 电话号码验证    
    jQuery.validator.addMethod("isPhone", function(value, element) {
        var tel = /^(\d{3,4}-?)?\d{7,9}$/g;
        return this.optional(element) || (tel.test(value));
    }, "请正确填写您的电话号码。");

    // 联系电话(手机/电话皆可)验证   
    jQuery.validator.addMethod("isTel", function(value,element) {
        var length = value.length;
        var mobile = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        var tel = /^(\d{3,4}-?)?\d{7,9}$/g;
        return this.optional(element) || tel.test(value) || (length==11 && mobile.test(value));
    }, "请正确填写您的联系方式");

    // sim卡号验证
    jQuery.validator.addMethod("isSim", function (value, element) {
        var length = value.length;
        var tel = /^(\d{3,4}-?)?\d{7,9}$/g;
        var mobile = /^((13[0-9]{1})|(14[5,7,9]{1})|(15[^4]{1})|(166)|(18[0-9]{1})|(19[8-9]{1})|(17[0,1,3,5,6,7,8]{1}))+\d{8}$/;
        return this.optional(element) || tel.test(value) || (length == 11 && mobile.test(value));
    }, "请输入SIM卡号数字，范围：7~13");

    // 表具编号验证
    jQuery.validator.addMethod("isMeterSN", function (value, element) {
        var length = value.length;
        var sn = /^[A-Z0-9]+$/;
        return this.optional(element) ||  (length == 7 && sn.test(value));
    }, "请输入表具编号，长度7，大写字母或数字");

    // 匹配qq      
    jQuery.validator.addMethod("isQq", function(value, element) {
        return this.optional(element) || /^[1-9]\d{4,12}$/;
    }, "匹配QQ");

    // 邮政编码验证    
    jQuery.validator.addMethod("isZipCode", function(value, element) {
        var zip = /^[0-9]{6}$/;
        return this.optional(element) || (zip.test(value));
    }, "请正确填写您的邮政编码。");

    // 匹配密码，以字母开头，长度在6-12之间，只能包含字符、数字和下划线。      
    jQuery.validator.addMethod("isPwd", function(value, element) {
        return this.optional(element) || /^[a-zA-Z]\\w{6,12}$/.test(value);
    }, "以字母开头，长度在6-12之间，只能包含字符、数字和下划线。");

    // 身份证号码验证
    jQuery.validator.addMethod("isIdCardNo", function(value, element) {
        //var idCard = /^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\w)$/;   
        return this.optional(element) || isIdCardNo(value);
    }, "请输入正确的身份证号码。");

    // IP地址验证   
    jQuery.validator.addMethod("ip", function(value, element) {
        return this.optional(element) || /^(([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.)(([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.){2}([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))$/.test(value);
    }, "请填写正确的IP地址。");

    // 多个以 # 隔开的IP地址验证   
    jQuery.validator.addMethod("batchIp", function(value, element) {
    	var ips = value.split("#");
    	var reg = /^(([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.)(([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.){2}([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))$/;
    	for (var i = 0;i < ips.length;i++) {
    		if (!reg.test(ips[i])) {
    			return false;
    		}
    	}
        return true;
    }, "");
    
    // 字符验证，只能包含中文、英文、数字、下划线等字符。    
    jQuery.validator.addMethod("stringCheck", function(value, element) {
        return this.optional(element) || /^[a-zA-Z0-9\u4e00-\u9fa5-_]+$/.test(value);
    }, "只能包含中文、英文、数字、下划线等字符");
    
    //字符验证，只能包含中文和英文
    jQuery.validator.addMethod("isCE", function(value, element) {
    	var reg=/^[a-zA-Z\u4e00-\u9fa5]$/
        return this.optional(element) || reg.test(value);
    }, "只能包含中文、英文");
    // 匹配english  
    jQuery.validator.addMethod("isEnglish", function(value, element) {
        return this.optional(element) || /^[A-Za-z]+$/.test(value);
    }, "匹配english");

    // 匹配汉字  
    jQuery.validator.addMethod("isChinese", function(value, element) {
        return this.optional(element) || /^[\u4e00-\u9fa5]+$/.test(value);
    }, "匹配汉字");

    // 匹配中文(包括汉字和字符) 
    jQuery.validator.addMethod("isChineseChar", function(value, element) {
        return this.optional(element) || /^[\u0391-\uFFE5]+$/.test(value);
    }, "匹配中文(包括汉字和字符) ");

    // 判断是否为合法字符(a-zA-Z0-9-_)
    jQuery.validator.addMethod("isRightfulString", function(value, element) {
        return this.optional(element) || /^[A-Za-z0-9_-]+$/.test(value);
    }, "判断是否为合法字符(a-zA-Z0-9-_)");
    
    // 判断是否为合法字符(油箱型号输入限制：中文、-、_、字母、数字、（）、*)
    jQuery.validator.addMethod("isRightfulString_oilBoxType", function(value, element) {
        return this.optional(element) || /^[A-Za-z0-9_.\(\)\（\）\*\u4e00-\u9fa5\-]+$/.test(value);
    }, "判断是否为合法字符(中文、-、_、字母、数字、（）、*)");
    
    // 判断是否为合法字符(a-zA-Z0-9)
    jQuery.validator.addMethod("isRightfulStr", function(value, element) {
        return this.optional(element) || /^[A-Za-z0-9]+$/.test(value);
    }, "判断是否为合法字符(a-zA-Z0-9)");

    // 判断是否包含中英文特殊字符，除英文"-_"字符外
    jQuery.validator.addMethod("isContainsSpecialChar", function(value, element) {
        var reg = RegExp(/[(\ )(\`)(\~)(\!)(\@)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\+)(\=)(\|)(\{)(\})(\')(\:)(\;)(\')(',)(\[)(\])(\.)(\<)(\>)(\/)(\?)(\~)(\！)(\@)(\#)(\￥)(\%)(\…)(\&)(\*)(\（)(\）)(\—)(\+)(\|)(\{)(\})(\【)(\】)(\‘)(\；)(\：)(\”)(\“)(\’)(\。)(\，)(\、)(\？)]+/);
        return this.optional(element) || !reg.test(value);
    }, "含有中英文特殊字符");
    

    //身份证号码的验证规则
    function isIdCardNo(num){
        //if (isNaN(num)) {alert("输入的不是数字！"); return false;} 
        var len = num.length, re;
        if (len == 15)
            re = new RegExp(/^(\d{6})()?(\d{2})(\d{2})(\d{2})(\d{2})(\w)$/);
        else if (len == 18)
            re = new RegExp(/^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\w)$/);
        else {
            //alert("输入的数字位数不对。"); 
            return false;
        }
        var a = num.match(re);
        if (a != null)
        {
            if (len==15)
            {
                var D = new Date("19"+a[3]+"/"+a[4]+"/"+a[5]);
                var B = D.getYear()==a[3]&&(D.getMonth()+1)==a[4]&&D.getDate()==a[5];
            }
            else
            {
                var D = new Date(a[3]+"/"+a[4]+"/"+a[5]);
                var B = D.getFullYear()==a[3]&&(D.getMonth()+1)==a[4]&&D.getDate()==a[5];
            }
            if (!B) {
                //alert("输入的身份证号 "+ a[0] +" 里出生日期不对。"); 
                return false;
            }
        }
        if(!re.test(num)){
            //alert("身份证最后一位只能是数字和字母。");
            return false;
        }
        return true;
    }

});

jQuery.validator.addMethod("compareDate",function(value,element,param){
    var assigntime = value;
    var deadlinetime =jQuery(param).val();
    var reg = new RegExp('-','g');
    assigntime = assigntime.replace(reg,'/');//正则替换
    deadlinetime = deadlinetime.replace(reg,'/');
    assigntime = new Date(parseInt(Date.parse(assigntime),10));
    deadlinetime = new Date(parseInt(Date.parse(deadlinetime),10));
    if(deadlinetime>assigntime){
        return false;
    }else{
        return true;
    }
},"<font color='#E47068'>结束日期必须大于开始日期</font>");


jQuery.validator.addMethod("compareDateDiff",function(value,element,param){
    var sData1=value;
    var sData2=jQuery(param).val();
    if(DateDiff(sData1.substring(0,10),sData2.substring(0,10))>=7){
        return false;
    }else{
        return true;
    }
},"<font color='#E47068'>查询的日期必须小于一周</font>");

//判断是否为合法字符(.0-9)
jQuery.validator.addMethod("isContainsNumberAndPoint", function(value, element, param) {
    return this.optional(element) || /^[0-9.]+$/.test(value);
}, "只能包含数字和.");

function DateDiff(sDate1, sDate2) {  //sDate1和sDate2是yyyy-MM-dd格式

    var aDate, oDate1, oDate2, iDays;
    // aDate = sDate1.split("-");
    oDate1 = new Date(sDate1);  //转换为yyyy-MM-dd格式
    // aDate = sDate2.split("-");
    oDate2 = new Date(sDate2);
    iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数

    return iDays;  //返回相差天数
}
/**
 * 判断选择的时间是否大于等与今天
 */
jQuery.validator.addMethod("selectDate",function(value,element) {
	return this.optional(element) || operationTime(value);
},"授权截止时间必须大于\等于今天");

function operationTime(value){
	var sDate = value;//字符串格式yyyy-MM-dd
	var nowDate = new Date();
	var newDate = nowDate.toLocaleDateString();//获取当前时间的日期 年/月/日(IE浏览器获取当前时间为x年x月x日)----字符串
	var reg = new RegExp(/[-\u4E00-\u9FA5\uF900-\uFA2D]/g);
	var aDate = sDate.replace(reg,"/");//把用户选择时间的字符串中的-替换成/
	var normDate = new Date(newDate.replace(reg,"/"));//把当前时间字符串转换为时间格式
	var selDate = new Date(aDate);//把用户选择的日期(字符串格式)转换为日期格式 年/月/日
	var nowDateTimestamp = normDate.getTime();//把当前时间转换为时间戳
	var selDateTimestamp = selDate.getTime();//把用户选择的时间转换为时间戳
	if(selDateTimestamp-nowDateTimestamp >= 0){
		return true;
	}else{
		return false;
	}

}
/**
 * 判断选择的时间是否小于等与今天
 */
jQuery.validator.addMethod("selectRegDate",function(value,element) {
	return this.optional(element) || operationRegTime(value);
},"注册日期必须小与/等于今天");

function operationRegTime(value){
	var sDate = value;//字符串格式yyyy-MM-dd
	var nowDate = new Date();
	var newDate = nowDate.toLocaleDateString();//获取当前时间的日期 年/月/日(IE浏览器获取当前时间为x年x月x日)----字符串
	var reg = new RegExp(/[-\u4E00-\u9FA5\uF900-\uFA2D]/g);
	var aDate = sDate.replace(reg,"/");//把用户选择时间的字符串中的-替换成/
	var normDate = new Date(newDate.replace(reg,"/"));//把当前时间字符串转换为时间格式
	var selDate = new Date(aDate);//把用户选择的日期(字符串格式)转换为日期格式 年/月/日
	var nowDateTimestamp = normDate.getTime();//把当前时间转换为时间戳
	var selDateTimestamp = selDate.getTime();//把用户选择的时间转换为时间戳
	if(nowDateTimestamp-selDateTimestamp >= 0){
		return true;
	}else{
		return false;
	}

}
//车牌号校验
jQuery.validator.addMethod("isBrand", function(value, element) {
    return isPlateNo(value);
}, "请填写正确的车牌号");

function isPlateNo(plateNo){
//    var re = /^[\u4e00-\u9fa5]{1}[A-Z]{1}[A-Z_0-9]{5}$/;
	// 京津冀晋蒙辽吉黑沪苏浙皖闽赣鲁豫鄂湘粤桂琼川贵云渝藏陕甘青宁新
	var re = /^[\u4eac\u6d25\u5180\u664b\u8499\u8fbd\u5409\u9ed1\u6caa\u82cf\u6d59\u7696\u95fd\u8d63\u9c81\u8c6b\u9102\u6e58\u7ca4\u6842\u743c\u5ddd\u8d35\u4e91\u6e1d\u85cf\u9655\u7518\u9752\u5b81\u65b0\u6d4b]{1}[A-Z]{1}[A-Z_0-9]{5}$/;
	//香港车牌规则
	var reg1 = /^[A-Z]{2}[0-9]{4}$/;
	if(re.test(plateNo) || reg1.test(plateNo)){
        return true;
    }
    return false;
}
jQuery.validator.addMethod("isGroupRequired",function(value,element,param){
    if(param == "true"){
    	if(value){
    		return true;
    	}else{
    		return false;
    	}
    }else{
    	return true;
    }
    
},"<font color='#E47068'>组织不能为空</font>");
//判断是否是大于0的合法数字 /^(?!(0[0-9]{0,}$))[0-9]{0,}[.]{0,}[0-9]{1,}$/ /^(?:[1-9]\d*|0)(?:\.\d+)?$/ 
jQuery.validator.addMethod("isFloatAndGtZero", function(value, element) {// 
    return this.optional(element) || /^(?:[1-9]\d*|0)(?:\.\d+)?$/.test(value) && value > 0;
}, "只能包含数字、小数点等字符并且要大于零");
jQuery.validator.addMethod("minSize", function(value, element,param) {// 
	var len =element.value.replace(/[\u4E00-\u9FA5]/g,'aa').length;
	var flag = true;
	if(len<param){
		flag = false;
	}
    return flag;
}, "");
jQuery.validator.addMethod("maxSize", function(value, element,param) {// 
	var len =element.value.replace(/[\u4E00-\u9FA5]/g,'aa').length;
	var flag = true;
	if(len>param){
		flag = false;
	}
    return flag;
}, "");

/**
 * 分组管理现在每个组织下最多存在100个分组
 */
jQuery.validator.addMethod("assignmentLimit100", function(value,element,param) {// 
	var flag = false;
	json_ajax("POST","/clbs/m/basicinfo/enterprise/assignment/assignCountLimit",null,false,{"group": $(param).val()},function (data) {
		if (data != null && data != undefined && data != "") {
			flag = data === 'true';
		}
	});
    return flag;
}, "");
/**
 * 判断树中是否选中车辆
 */
jQuery.validator.addMethod("zTreeChecked",function(value,element,param){
	var check=false;
	var zTree = $.fn.zTree.getZTreeObj(param), 
	nodes = zTree.getCheckedNodes(true),
	v = "";
	for (var i = 0, l = nodes.length; i < l; i++) {
		if (nodes[i].type == "vehicle") {
			v += nodes[i].name + ",";
		}
	}
	if(v){
		return true;
	}
	return check;
},"");

/**
 * 开始时间和结束时间必须同时存在或者同时不存在
 */
jQuery.validator.addMethod("timeNotNull", function(value,element,param) {// 
	if ($(param).val() != null && $(param).val() != "" && (value == null || value == "")) {
		return false;
	}else{
		return true;
	}
}, "");

/**
 * 根据不同监控对象类型校验终端编号
 */
jQuery.validator.addMethod("checkDeviceNumber", function(value,element,param) {// 
	var Dtype=$(param).val();//终端类型
	if(Dtype==5){//判断人
		return this.optional(element) || /^[0-9a-zA-Z]{1,20}$/.test(value);
	}else{//判断车
		if(/^[_-]+$/.test(value)){//如果全是横杠和下划线则不通过
			return this.optional(element) || false;
		}
		return this.optional(element) || /^[0-9a-zA-Z_-]{7,15}$/.test(value);
	}
}, "");

/**
 * 校验人员姓名
 */
jQuery.validator.addMethod("checkPeopleName", function(value,element,param) {// 
	if(/^[A-Za-z\u4e00-\u9fa5]{0,8}$/.test(value)){
		return true;
	}
	return false;
}, "");

/**
 * 校验人员编号
 */
jQuery.validator.addMethod("checkRightPeopleNumber", function(value,element,param) {// 
	if(/^[A-Za-z0-9\u4e00-\u9fa5_-]+$/.test(value)){
		return true;
	}
	return false;
}, "");

//电子围栏输入的经纬度验证
jQuery.validator.addMethod("isLngLat", function(value, element, params) { 
   var this_value = value;
   if(this_value.indexOf(',') != -1){
	   var this_value_array = this_value.split(',');
	   if((Number(this_value_array[0]) > 73.66 && Number(this_value_array[0]) < 135.05) && (Number(this_value_array[1]) > 3.86 && Number(this_value_array[1]) < 53.55)){
		   return true;
	   }else{
		   return false;
	   };
   }else{
	   return false;
   };
}, '请输入正确的经纬度');
//电子围栏输入的经度验证
jQuery.validator.addMethod("isLng", function(value, element, params) { 
   var this_value = value;
   if(this_value != ''){
	   if(Number(this_value) > 73.66 && Number(this_value) < 135.05){
		   return true;
	   }else{
		   return false;
	   };
   }else{
	   return false;
   };
}, '请输入正确的经度');
//电子围栏输入的纬度验证
jQuery.validator.addMethod("isLat", function(value, element, params) { 
   var this_value = value;
   if(this_value != ''){
	   if(Number(this_value) > 3.86 && Number(this_value) < 53.55){
		   return true;
	   }else{
		   return false;
	   };
   }else{
	   return false;
   };
}, '请输入正确的纬度');

//字符验证，只能包含中文和英文(全部匹配,只能包含中文和英文)
jQuery.validator.addMethod("isCN", function(value, element) {
    var reg=/^[a-zA-Z\u4e00-\u9fa5]+$/
    return this.optional(element) || reg.test(value);
}, "只能包含中文、英文");

//上报频率设置-上报起始时间校验
jQuery.validator.addMethod("checkRequiteTime", function(value, element, params) {
    if(params==9){
    	return true;
    }else{
    	return value!=null && value!="";
    }
}, "");
//定点和校时-定点时间校验
jQuery.validator.addMethod("checkLocationTimes", function(value, element, params) {
	var obj=document.getElementsByName("locationTimes");
	for(i=0;i<obj.length;i++){
		if(obj[i].value){
			return true;
		}
	}
	return false;
}, "");

/**
 * 如果勾选了，校验是否必填
 */
jQuery.validator.addMethod("isCheckedRequested", function(value,element,param) {// 
	var checked = $(param).is(":checked"); //终端类型
	if(checked){ // 勾选
		if (value == null || value == undefined || value == ""){
    		return false;
    	}
	}
	return true;
}, "");

/**
 * 如果勾选了，校验是否是数字
 */
jQuery.validator.addMethod("isCheckedNumber", function(value,element,param) {// 
	var paramlist = param.split(",");
	var checked = $(paramlist[0]).is(":checked"); //终端类型
	if(checked){ // 勾选
		var re = /^[0-9]+$/;
		if (!re.test(value) || Number(value) > Number(paramlist[2]) || Number(value) < Number(paramlist[1])){ //true:数字。false：非数字
    		return false;
    	}
	}
	return true;
}, "");

/**
 * 如果勾选了，校验是否是是在范围内
 */
jQuery.validator.addMethod("isCheckedNumber2", function(value,element,param) {// 
	var paramlist = param.split(",");
	console.log("ffff"+paramlist[2]+paramlist[1])

	var checked = $(paramlist[0]).is(":checked"); //终端类型
	if(checked){ // 勾选
		var re = /^[0-9]+$/;
		if (Number(value) <= Number(paramlist[2]) && Number(value) >= Number(paramlist[1])){ //true:数字。false：非数字
    		return true;
    	}else{
    		return false;
    	}
	}
	return true;
}, "");
//校验如果启用了定时唤醒，进行时间校验不能为空
jQuery.validator.addMethod("isCheckedRequested2", function(value,element,param) {// 
	var paramlist = param.split(",");
	var checked = $(paramlist[0] ).is(":checked"); //终端类型
	var seleted=$(paramlist[1]).val();
	if(checked&&seleted=="1"){ // 勾选
		if (value == null || value == undefined || value == ""){
    		return false;
    	}
	}
	return true;
}, "");
//校验如果启用了定时唤醒，进行时间校验关闭时间不能大于开始时间
jQuery.validator.addMethod("isCheckedtime", function(value,element,param) {
	var paramlist = param.split(",");
	var checked = $(paramlist[0] ).is(":checked"); //终端类型
	var seleted=$(paramlist[1]).val();
	var time1=$(paramlist[2]).val();
	var time2=$(paramlist[3]).val();
	if(checked&&seleted=="1"){ // 勾选
		if (compTime(time1,time2)){
    		return false;
    	}
	}
	return true;
}, "");

/*
 * 校验中英文数字字符串，以传过来的参数做类型校验及输入限制(例：param = "1,1,20" 表示匹配中英文数字范围1-20)
 * 类型：1:中英文数字，2：中英文，3：中文数字，4：英文数字,5：中文,6：英文,7：数字,8:英文数字点
 */
jQuery.validator.addMethod("checkCAENumber", function(value,element,param) {
	var strs = param.split(",");
	var type = strs[0];//类型
	var minLimit = strs[1];//最小长度
	var maxLimit = strs[2];//最大长度
	var typeString;
	switch (type) {
		case "1":
			typeString = "[a-zA-Z0-9\u4e00-\u9fa5]";
			break;
		case "2":
			typeString = "[a-zA-Z\u4e00-\u9fa5]";
			break;
		case "3":
			typeString = "[0-9\u4e00-\u9fa5]";
			break;
		case "4":
			typeString = "[a-zA-Z0-9]";
			break;
		case "5":
			typeString = "[\u4e00-\u9fa5]";
			break;
		case "6":
			typeString = "[a-zA-Z]";
			break;
		case "7":
			typeString = "[0-9]";
			break;
		case "8":
			typeString = "[a-zA-Z0-9.]";
			break;
			
		default:
			return false;
			break;
	}
	var reg = new RegExp("^"+ typeString +"{" + minLimit + "," + maxLimit + "}$");
	if (reg.test(value)) {
		return true;
	} else {
		return false;
	}
}, "");

/**
 * 检查是否是正确版本号
 */
jQuery.validator.addMethod("checkVersion", function(value,element,param) {
	var reg = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9]?[0-9])){0,2}$/;
	if (reg.test(value)) {
		return true;
	}
	return false;
}, "");

function compTime(time1,time2){    
   var  array1 = time1.split(":");  
   var  total1 = parseInt(array1[0])*3600+parseInt(array1[1])*60;  
   var  array2 = time2.split(":");  
   var  total2 = parseInt(array2[0])*3600+parseInt(array2[1])*60;  
    return total1-total2>=0?true:false;  
            
}  


// 弹出窗口
toastr.options = {
    closeButton: true,
    debug: false,
    progressBar: true,
    positionClass: 'toast-top-right',
    timeOut: 2000
};

// 操作成功
function tg_alertSuccess(title, message) {
    //toastr.success(!title ? '操作成功' : title, !message ? '恭喜您，操作成功！' : message);
}

// 系统消息
function tg_alertInfo(title, message) {
    toastr.info(!title ? '系统消息' : title, !message ? '系统消息!' : message);
}

// 系统警告
function tg_alertWarning(title, message) {
    toastr.warning(!title ? '系统警告' : title, !message ? '系统警告!' : message);
}

// 系统错误
function tg_alertError(title, message) {
    tg_confirmDialog(!title ? '系统错误' : title, !message ? '对不起，操作失败！' : message);
    //  toastr.error(!title ? '系统错误' : title, !message ? '对不起，操作失败！' : message);
}

// tg_confirmDialog
function tg_confirmDialog(title, message, okCallbackFun, cancelCallbackFun) {
    layer.confirm(!message ? '您确定要执行该操作吗？！' : message, {
        title: !title ? '操作确认' : title,
        icon: 3, // 问号图标
        move: false,//禁止拖动
        btn: ['确定', '取消']
    }, function () {
        // 确定按钮操作
        if (okCallbackFun) {
            okCallbackFun();
        }
        layer.closeAll(); // 关闭layer
    }, function () {
        // 取消按钮操作
        if (cancelCallbackFun) {
            cancelCallbackFun();
        }
    });
}

// 基本表单ajax 提交
function tg_baseFormAjaxSubmit(formId, rules, messages, sucCallbackFun, failCallbackFun) {
    var sucCallback = function (responseText, statusText) {
        if (responseText.success) {
            if (sucCallbackFun) {
                sucCallbackFun(); // 回调函数
            } else {
                tg_alertSuccess();
            }
        } else {
            form.attr("checkSubmitFlag", false);
            if (failCallbackFun) {
                failCallbackFun(); // 回调函数
            } else {
                tg_alertError('操作失败', responseText.msg);
            }
        }
    };
    var options = {
        success: sucCallback, // 提交后的回调函数
        dataType: 'json', // 接受服务端返回的类型
        clearForm: true, // 成功提交后，清除所有表单元素的值
        resetForm: true, // 成功提交后，重置所有表单元素的值
        timeout: 5000
    };
    var form = $("#" + formId);
    // 表单验证
    var validator = form.validate({
        rules: !rules ? {} : rules,
        messages: !messages ? {} : messages,
        // errorPlacement : function(error, element) {
        // error.insertBefore(element.parent());
        // },
        submitHandler: function (f) {
            if (!form.attr("checkSubmitFlag")) {
                form.attr("checkSubmitFlag", true);
                form.ajaxSubmit(options);
            }
        }
    });
    return false; // 阻止表单默认提交
}

// 表单窗口ajax 提交
function tg_formWinAjaxSubmit(formModalId, formId, rules, messages, sucCallbackFun, failCallbackFun) {
    var formModal = $("#" + formModalId);
    var form = $("#" + formId);
    var callbackFun = function () {
        tg_alertSuccess();
        form[0].reset();
        formModal.modal("hide");
        formModal.removeData("bs.modal");
        if (sucCallbackFun) {
            sucCallbackFun(); // 回调函数
        }
    };
    tg_baseFormAjaxSubmit(formId, rules, messages, callbackFun, failCallbackFun);
}

// 简单Ajax Post操作数据
function tg_simpleAjaxPost(url, parms, sucCallbackFun, failCallbackFun) {
    $.ajax({
        url: url,
        type: 'POST',
        data: parms,
        error: function () {
            tg_alertError();
        },
        success: function (d) {
            var result = $.parseJSON(d);
            if (result.success) {
                if (sucCallbackFun) {
                    sucCallbackFun(d); // 回调函数
                } else {
                    tg_alertSuccess();
                }
            } else {
                if (failCallbackFun) {
                    failCallbackFun(d); // 回调函数
                } else {
                    tg_alertError('操作失败', result.msg);
                }
            }
        }
    });
}

// 删除
function tg_dleteItem(url, sucCallbackFun, failCallbackFun) {
    var okCallbackFun = function () {
        tg_simpleAjaxPost(url, null, sucCallbackFun, failCallbackFun);
    };
    // console.log("tg_dleteItem:url",url);
    if (url.substr(0, url.lastIndexOf("/")) == "/devm/simcard"
        // || url.includes("/devm/simcard")
        || url.substr(0, url.lastIndexOf("/")) == "/clbs/m/functionconfig/fence/bindfence"
        || url.substr(0, url.lastIndexOf("/")) == "/clbs/v/workhourmgt/vbbind"
        || url.substr(0, url.lastIndexOf("/")) == "/clbs/v/oilmgt/fluxsensorbind"
        || url.substr(0, url.lastIndexOf("/")) == "/clbs/v/oilmassmgt/oilvehiclesetting")
        tg_confirmDialog(null, "您确定要解除此绑定关系吗？", okCallbackFun);
    else
        tg_confirmDialog(null, "删掉就没啦，请谨慎下手！", okCallbackFun);
}

//批量删除
function tg_dleteItems(url, parms, sucCallbackFun, failCallbackFun) {
    var okCallbackFun = function () {
        tg_simpleAjaxPost(url, parms, sucCallbackFun, failCallbackFun);
    };
    if (url.substr(0, url.lastIndexOf("/")) == "/clbs/m/infoconfig/infoinput"
        || url.substr(0, url.lastIndexOf("/")) == "/clbs/m/functionconfig/fence/bindfence"
        || url.substr(0, url.lastIndexOf("/")) == "/clbs/v/workhourmgt/vbbind"
        || url.substr(0, url.lastIndexOf("/")) == "/clbs/v/oilmgt/fluxsensorbind"
        || url.substr(0, url.lastIndexOf("/")) == "/clbs/v/oilmassmgt/oilvehiclesetting")
        tg_confirmDialog(null, "您确定要解除所选绑定关系吗？", okCallbackFun);
    else
        tg_confirmDialog(null, "删掉就没啦，请谨慎下手！", okCallbackFun);
}

// 修改是否可用
function tg_changeEnabled(c, id, enableUrl, disableUrl, sucCallbackFun) {
    if (c.checked) {// 原来禁用 现在启用
        // 操作失败还原按钮状态
        var failCallbackFun1 = function () {
            // $(c).trigger("click");
            c.checked = false;
            $(c).bootstrapToggle('destroy');
            $(c).bootstrapToggle();
        };
        // 确定操作
        var okCallbackFun1 = function () {
            tg_simpleAjaxPost(enableUrl, null, sucCallbackFun, failCallbackFun1);
        };
        tg_confirmDialog(null, "您确定要启用该条数据吗？", okCallbackFun1, failCallbackFun1);
    } else { // 原来启用 现在停用
        // 操作失败还原按钮状态
        var failCallbackFun = function () {
            c.checked = true;
            $(c).bootstrapToggle('destroy');
            $(c).bootstrapToggle();
        };
        // 确定操作
        var okCallbackFun = function () {
            tg_simpleAjaxPost(disableUrl, null, sucCallbackFun, failCallbackFun);
        };
        tg_confirmDialog(null, "您确定要停用该条数据吗？", okCallbackFun, failCallbackFun);
    }
}

// 创建表格
var myDataTable;
var pageNumber = null;
var setPageNumber = null;

function tg_createTable(tg_table) {
    layer.load(2);
    var pageable = tg_table.pageable;
    var lengthChange = true;
    var info = true;
    if (!pageable) {
        lengthChange = false;
        info = false;
    }
    ;
    if (setPageNumber != null) {
        lengthChange = setPageNumber;
    }
    ;
    myDataTable = $('#' + tg_table.dataTableDiv).DataTable({
        // 语言
        "language": {
            "search": "搜索:",
            "processing": "处理中...",
            "loadingRecords": "加载中...",
            "lengthMenu": "每页 _MENU_ 条记录",
            "info": "第 _START_ 至 _END_ 条记录，共 _TOTAL_ 条",
            "infoEmpty": "当前显示0到0条，共0条记录",
            "infoFiltered": "(共 _MAX_ 条)",
            "emptyTable": "我本将心向明月，奈何明月照沟渠，不行您再用其他方式查一下？",
            "zeroRecords": "我本将心向明月，奈何明月照沟渠，不行您再用其他方式查一下？",
            "paginate": {
                "first": "首页",
                "previous": "上一页",
                "next": "下一页",
                "last": "末页"
            }
        },
        "dom": "t" + "<'row'<'col-md-3 col-sm-12 col-xs-12'l><'col-md-4 col-sm-12 col-xs-12'i><'col-md-5 col-sm-12 col-xs-12'p>>",
        /* "scrollX": true,
         "bAutoWidth": false,  //是否自适应宽度*/

        "searching": false, // 搜索
        // 分页相关
        "paging": pageable,
        "destroy": true,
        "pagingType": "full_numbers", // 分页样式
        "lengthChange": lengthChange,// 切换每页数据大小
        "info": info,
        "pageLength": pageNumber == null ? 10 : pageNumber, // 默认每页数据量
        "lengthMenu": [10, 20, 50, 100, 200],
        "ordering": false, // 禁用排序
        // 服务端
        "processing": false,
        "serverSide": true,
        "drawCallback": function (settings) {
            layer.closeAll('loading');
        },
        "ajax": {
            "url": tg_table.listUrl,
            "type": "GET", // GET方式请求
            "data": tg_table.ajaxDataParamFun,
            // data:{'csrfmiddlewaretoken': '{{ csrf_token }}'},
            "complete": function (r) {
                if (r.responseText.indexOf("<form id=\"loginForm") > 0) {
                    window.location.replace("/login?type=expired");
                    return;
                }
                if (tg_table.sync_address) {
                    //如果地址为空,就执行异步查询地址
                    var riskDisposeRecords = r.responseJSON.records;
                    var formattedAddress;
                    for (var i = 0, n = riskDisposeRecords.length; i < n; i++) {
                        formattedAddress = riskDisposeRecords[i].formattedAddress;
                        if (formattedAddress == null || formattedAddress === '') {
                            setTimeout((function (j) {
                                formatted_address(tg_table.dataTableDiv, riskDisposeRecords[j], tg_table.address_index, j + 1);
                            })(i), 30);
                        }
                    }
                }
            },
            //  "error":error,
            //"dataSrc" : "records"
            "dataSrc": function (json) {
                if (!json.success) {
                    layer.msg("系统的情绪不稳定，并向你扔了一个错误~");
                    return [];
                }
                if (tg_table.dataTableDiv == 'dataTableBind') {
                    if ($('#TabCarBox').hasClass('active')) {
                        var dataLength = json.records.length;
                        var wHeight = $(window).height();
                        if (dataLength == 0) {
                            $("#MapContainer").animate({'height': (wHeight - 80 - 44 - 220) + 'px'});
                            $('#bingListClick i').attr('class', 'fa fa-chevron-down');
                        } else {
                            $("#MapContainer").animate({'height': (wHeight - 80 - dataLength * 46 - 220) + 'px'});
                            $('#bingListClick i').attr('class', 'fa fa-chevron-down');
                        }
                        ;
                    }
                    ;
                }
                ;
                //sync_address 判断这个条件防止风险处置记录重复发送
                if (tg_table.getAddress && json.records && !tg_table.sync_address) {
                    setTimeout(function () {
                        geocoder_CallBack(tg_table.dataTableDiv, json.records, tg_table.address_index);
                    }, 30);
                }
                ;
                return json.records
            }
        },
        "columnDefs": tg_table.columnDefs,
        "columns": tg_table.columns
    });
    // 把dataTable赋给tg_table
    tg_table.dataTable = myDataTable;
    // 渲染事件
    myDataTable.on('draw', function (e, settings, json) {
        // 修改是否可用
        if (tg_table.enabledChange) {
            $('.js-switch').bootstrapToggle();
        }
        // 第一列索引列
        if (tg_table.showIndexColumn) {
            var info = myDataTable.page.info();
            myDataTable.column(0, {
                search: 'applied',
                order: 'applied'
            }).nodes().each(function (cell, i) {
                cell.innerHTML = info.start + i + 1;
            });
        }
        // 回调
        if (tg_table.drawCallbackFun) {
            tg_table.drawCallbackFun();
        }
    });
    //显示隐藏列
    $('.toggle-vis').on('change', function (e) {
        e.preventDefault();
        var column = myDataTable.column($(this).attr('data-column'));
        column.visible(!column.visible());
        // $(".keep-open").addClass("open");
        $(this).parent().parent().parent().parent().addClass("open");
    });
    //权限显示
    var flag = $('#permission').val();
    if (flag == "false") {
        for (var i = 1; i < 3; i++) {
            var columnTr = myDataTable.column(i);
            columnTr.visible(!columnTr.visible());
        }
        ;
    }
    /*$('#AddDelete').click(function() {

    });*/
}

// 创建公共表格
var TG_Tabel = {
    createNew: function (option) {
        if (option.pageNumber != undefined) {
            pageNumber = option.pageNumber;
        }
        ;
        if (option.setPageNumber != undefined) {
            setPageNumber = option.setPageNumber;
        }
        ;

        var tg_table = {};
        tg_table.listUrl = option.listUrl; // 请求url
        tg_table.editUrl = option.editUrl; // 修改url
        tg_table.detailUrl = option.detailUrl;//详情
        tg_table.deleteUrl = option.deleteUrl; // 删除url
        tg_table.deletemoreUrl = option.deletemoreUrl//批量删除url
        tg_table.enableUrl = option.enableUrl; // 启用url
        tg_table.disableUrl = option.disableUrl; // 停用
        tg_table.columnDefs = option.columnDefs; // 列定义
        tg_table.columns = option.columns; // 列
        tg_table.ajaxDataParamFun = option.ajaxDataParamFun; // 列
        tg_table.dataTableDiv = option.dataTableDiv; // 渲染表格的div
        tg_table.showIndexColumn = option.showIndexColumn; // 是否显示第一列的索引列
        tg_table.pageable = option.pageable; // 是否分页
        tg_table.enabledChange = option.enabledChange; // 可用状态修改
        tg_table.suffix = !option.suffix ? '.gsp' : option.suffix; // 后缀，默认.gsp
        tg_table.getAddress = option.getAddress == undefined ? false : option.getAddress;//是否逆地理编码
        tg_table.address_index = option.address_index == undefined ? '' : option.address_index;
        tg_table.sync_address = option.sync_address == undefined ? '' : option.sync_address;
        // 成功后回调
        var drawCallbackFun = function () {
            if (option.drawCallbackFun) {
                option.drawCallbackFun();
            }
        };
        tg_table.drawCallbackFun = drawCallbackFun;
        // 初始化
        tg_table.init = function () {
            tg_createTable(tg_table); // 创建表格
        };
        // checked 取消
        tg_table.checkedCancel = function () {
            //取消全选勾
            $("#checkAll").prop('checked', false);
            $("#tableCheckAll").prop('checked', false);
            $("input[name=subChk]").prop("checked", false);
        }
        // 刷新
        tg_table.refresh = function () {
            tg_table.checkedCancel();
            tg_table.dataTable.draw(false); // 重新加载数据
        };
        // 重新渲染表格
        tg_table.requestData = function () {
            tg_table.checkedCancel();
            tg_table.dataTable.draw(true); // 重新加载数据
        };
        // 过滤
        tg_table.filter = function () {
            tg_table.refresh(); // 重新加载数据
        };
        // 新增
        tg_table.add = function (windowId, formId, rules, messages) {
            tg_formWinAjaxSubmit(windowId, formId, rules, messages, tg_table.requestData);
        };
        //修改
        tg_table.edit = function (windowId, formId, rules, messages) {
            tg_formWinAjaxSubmit(windowId, formId, rules, messages, tg_table.filter);
        };
        // 删除
        tg_table.deleteItem = function (id) {
            var deleteUrlPath = tg_table.deleteUrl + id + tg_table.suffix;
            var allLen = $("#dataTable tbody").children('tr').length;
            var currPage = parseInt($(".paginate_button.active a").text());

            var sucCallbackfun = function () {
                tg_alertSuccess();
                tg_table.refresh();
                if (allLen == 1 && currPage != 1) {
                    tg_table.dataTable.page(currPage - 2).draw(false);
                }
            };

            tg_dleteItem(deleteUrlPath, sucCallbackfun);
        };
        tg_table.deleteItemTwo = function (id) {
            var deleteUrlPath = tg_table.deleteUrl + id + tg_table.suffix;
            var sucCallbackfun = function () {
                tg_alertSuccess();
                tg_table.refresh();
            };

            tg_dleteItem(deleteUrlPath, sucCallbackfun);
        };
        //批量删除
        tg_table.deleteItems = function (parms) {
            var deletemoreUrlPath = tg_table.deletemoreUrl;
            var delLen = parms.deltems.split(',').length;
            var currPage = parseInt($(".paginate_button.active a").text());
            var allLen = $("#dataTable tbody").children('tr').length;
            var sucCallbackfun = function () {
                tg_alertSuccess();
                //取消全选勾
                $("#checkAll").prop('checked', false);
                $("#tableCheckAll").prop('checked', false);
                $("input[name=subChk]").prop("checked", false);

                tg_table.refresh();
                if (currPage != 1 && delLen == allLen) {
                    tg_table.dataTable.page(currPage - 2).draw(false);
                }
            };
            var failCallBackFun = function (d) {
                var result = $.parseJSON(d);
                tg_table.refresh();
                tg_alertError('操作失败', result.msg);
            };
            tg_dleteItems(deletemoreUrlPath, parms, sucCallbackfun, failCallBackFun);
        };
        // 单个解除
        tg_table.relieveItem = function (id) {
            var deleteUrlPath = tg_table.deleteUrl + id + tg_table.suffix;
            var sucCallbackfun = function () {
                tg_alertSuccess();
                tg_table.refresh();
            };

            tg_dleteItem(deleteUrlPath, sucCallbackfun);
        };
        //批量解除
        tg_table.relieveItems = function (parms) {
            var deletemoreUrlPath = tg_table.deletemoreUrl;
            var sucCallbackfun = function () {
                tg_alertSuccess();
                //取消全选勾
                $("#checkAll").prop('checked', false);
                $("#tableCheckAll").prop('checked', false);
                $("input[name=subChk]").prop("checked", false);

                tg_table.refresh();
            };
            var failCallBackFun = function (d) {
                var result = $.parseJSON(d);
                tg_table.refresh();
                tg_alertError('操作失败', result.msg);
            };
            tg_dleteItems(deletemoreUrlPath, parms, sucCallbackfun, failCallBackFun);
        };
        // 报警参数设置批量删除
        tg_table.deleteAlarmSettingsItems = function (parms) {
            var deletemoreUrlPath = tg_table.deletemoreUrl;
            var sucCallbackfun = function () {
                var checkedList = new Array();
                var settingUrl = settingMoreUrl.replace("{id}.gsp", checkedList.toString() + ".gsp?deviceType=0");
                $("#settingMoreBtn").attr("href", settingUrl);
                tg_alertSuccess();
                tg_table.refresh();
            };
            tg_dleteItems(deletemoreUrlPath, parms, sucCallbackfun);
        };
        // 报警参数设置删除
        tg_table.deleteAlarmSettingsItem = function (id) {
            var deleteUrlPath = tg_table.deleteUrl + id + tg_table.suffix;
            var sucCallbackfun = function () {
                var checkedList = new Array();
                var settingUrl = settingMoreUrl.replace("{id}.gsp", checkedList.toString() + ".gsp?deviceType=0");
                $("#settingMoreBtn").attr("href", settingUrl);
                tg_alertSuccess();
                tg_table.refresh();
            };

            tg_dleteItem(deleteUrlPath, sucCallbackfun);
        };

        // 修改是否可用
        tg_table.changeEnabled = function (c, id) {
            var enableUrlPath = tg_table.enableUrl + id + tg_table.suffix;
            var disableUrlPath = tg_table.disableUrl + id + tg_table.suffix;
            tg_changeEnabled(c, id, enableUrlPath, disableUrlPath);
        };
        return tg_table;
    }
};
// 锁定成功，弹出解锁对话框
var lockSucPrompt = function (logoutUrl, unlockUrl) {
    layer.prompt({
        formType: 1,
        closeBtn: 0,
        btn: ['解除锁定', '重新登录'], // 可以无限个按钮
        title: "系统已锁定，请输入密码解锁！",
        btn2: function () {
            window.location.href = logoutUrl;
            return false;
        },
    }, function (value, index, elem) {
        if (value) {
            if (value.length < 6) {
                tg_alertError("解锁失败", "密码太短，请重新输入！");
            } else if (value.length > 25) {
                tg_alertError("解锁失败", "密码太长，请重新输入！");
            } else {
                var parms = {
                    userPass: value
                };
                tg_simpleAjaxPost(unlockUrl, parms, function () {
                    tg_alertSuccess("解锁成功", "密码正确，解锁成功！");
                    layer.close(index);
                }, function () {
                    tg_alertError("解锁失败", "密码不正确，请重新输入！");
                    return false;
                });
            }
        }
    });
};

// 锁定系统屏幕
function tg_lock(lockUrl, logoutUrl, unlockUrl) {
    // 成功回调操作
    var sucCallbackFun = function () {
        lockSucPrompt(logoutUrl, unlockUrl);
    };
    tg_simpleAjaxPost(lockUrl, null, sucCallbackFun, null);
}

// 检查锁定系统屏幕
function tg_checkLock(checkLockUrl, logoutUrl, unlockUrl) {
    // 锁定回调操作
    var sucCallbackFun = function () {
        lockSucPrompt(logoutUrl, unlockUrl);
    };
    // 未锁定回调操作
    var falseCallbackFun = function () {
    };
    tg_simpleAjaxPost(checkLockUrl, null, sucCallbackFun, falseCallbackFun);
}

//后台分页逆地理编码
var lngLatIndex = 0;

function geocoder_CallBack(this_id, msg, address_index) {
    lngLatIndex = 0;
    var addressLngLatArray = [];
    for (var i = 0, len = msg.length; i < len; i++) {
        var addressMsg = [];
        var address = msg[i].longtitude + "," + msg[i].latitude;
        //经纬度正则表达式
        var Reg = /^(180\.0{4,7}|(\d{1,2}|1([0-7]\d))\.\d{4,20})(,)(90\.0{4,8}|(\d|[1-8]\d)\.\d{4,20})$/;
        if (address != null && Reg.test(address)) {
            addressMsg = [msg[i].longtitude, msg[i].latitude];
        } else {
            addressMsg = ["124.411991", "29.043817"];
        }
        addressLngLatArray.push(addressMsg);
    }
    ;

    if (addressLngLatArray.length > 0) {
        getAddress(this_id, addressLngLatArray, address_index);
    }
};

function formatted_address(this_id, msg, address_index, index) {

    var addressMsg = [];
    var address = msg.longtitude + "," + msg.latitude;
    //经纬度正则表达式
    var Reg = /^(180\.0{4,7}|(\d{1,2}|1([0-7]\d))\.\d{4,20})(,)(90\.0{4,8}|(\d|[1-8]\d)\.\d{4,20})$/;
    if (address != null && Reg.test(address)) {
        addressMsg = [msg.longtitude, msg.latitude];
    } else {
        addressMsg = ["124.411991", "29.043817"];
    }
    $.ajax({
        type: "post",
        url: "/clbs/v/monitoring/getAddress",
        dataType: "json",
        async: true,
        data: {lnglatXYs: addressMsg},
        traditional: true,
        timeout: 30000,
        success: function (data) {
            if (data.success == undefined) {
                var this_address = data;
                if (this_address == "AddressNull") {
                    var geocoder = new AMap.Geocoder({
                        radius: 1000,
                        extensions: "base"
                    });
                    geocoder.getAddress(addressMsg);
                    AMap.event.addListener(geocoder, "complete", function (GeocoderResult) {
                        var addressValue;
                        if (GeocoderResult.info == 'NO_DATA') {
                            addressValue = '未定位';
                        } else {
                            addressValue = GeocoderResult.regeocode.formattedAddress;
                            var addressParticulars = getaddressParticulars(GeocoderResult, addressMsg[0], addressMsg[1]);
                            $.ajax({
                                type: "POST",
                                url: "/clbs/v/monitoring/setAddress",
                                dataType: "json",
                                async: true,
                                data: {"addressNew": addressParticulars},
                                traditional: false,
                                timeout: 30000,
                            });
                        }
                        ;
                        $("#" + this_id).children("tbody").children("tr:nth-child(" + index + ")").children("td:nth-child(" + address_index + ")").text(addressValue);
                    });
                } else {
                    var addressValue = this_address;
                    $("#" + this_id).children("tbody").children("tr:nth-child(" + index + ")").children("td:nth-child(" + address_index + ")").text(addressValue);
                }
            } else {
                var addressValue = '未定位';
                $("#" + this_id).children("tbody").children("tr:nth-child(" + index + ")").children("td:nth-child(" + address_index + ")").text(addressValue);
            }
        }
    })
};

function getAddress(this_id, msg, address_index) {
    var lngLatValue = msg[lngLatIndex];
    $.ajax({
        type: "post",
        url: "/clbs/v/monitoring/getAddress",
        dataType: "json",
        async: true,
        data: {lnglatXYs: lngLatValue},
        traditional: true,
        timeout: 30000,
        success: function (data) {
            if (data.success == undefined) {
                var this_address = data;
                if (this_address == "AddressNull") {
                    var geocoder = new AMap.Geocoder({
                        radius: 1000,
                        extensions: "base"
                    });
                    geocoder.getAddress(lngLatValue);
                    AMap.event.addListener(geocoder, "complete", function (GeocoderResult) {
                        lngLatIndex++;
                        var addressValue;
                        if (GeocoderResult.info == 'NO_DATA') {
                            addressValue = '未定位';
                        } else {
                            addressValue = GeocoderResult.regeocode.formattedAddress;
                            var addressParticulars = getaddressParticulars(GeocoderResult, lngLatValue[0], lngLatValue[1]);
                            $.ajax({
                                type: "POST",
                                url: "/clbs/v/monitoring/setAddress",
                                dataType: "json",
                                async: true,
                                data: {"addressNew": addressParticulars},
                                traditional: false,
                                timeout: 30000,
                            });
                        }
                        ;
                        $("#" + this_id).children("tbody").children("tr:nth-child(" + lngLatIndex + ")").children("td:nth-child(" + address_index + ")").text(addressValue);
                        if (lngLatIndex < msg.length) {
                            getAddress(this_id, msg, address_index);
                        }
                        ;
                    });
                } else {
                    lngLatIndex++;
                    var addressValue = this_address;
                    $("#" + this_id).children("tbody").children("tr:nth-child(" + lngLatIndex + ")").children("td:nth-child(" + address_index + ")").text(addressValue);
                    if (lngLatIndex < msg.length) {
                        getAddress(this_id, msg, address_index);
                    }
                    ;
                }
                ;
            } else {
                lngLatIndex++;
                var addressValue = '未定位';
                $("#" + this_id).children("tbody").children("tr:nth-child(" + lngLatIndex + ")").children("td:nth-child(" + address_index + ")").text(addressValue);
                if (lngLatIndex < msg.length) {
                    getAddress(this_id, msg, address_index);
                }
                ;
            }
            ;
        }
    })
};

function getaddressParticulars(AddressNew, longitude, latitude) {
    var addressParticulars = {
        "longitude": longitude.substring(0, longitude.lastIndexOf(".") + 4),
        "latitude": latitude.substring(0, latitude.lastIndexOf(".") + 4),
        "adcode": AddressNew.regeocode.addressComponent.adcode,//区域编码
        "building": AddressNew.regeocode.addressComponent.building,//所在楼/大厦
        "buildingType": AddressNew.regeocode.addressComponent.buildingType,
        "city": AddressNew.regeocode.addressComponent.city,
        "cityCode": AddressNew.regeocode.addressComponent.citycode,
        "district": AddressNew.regeocode.addressComponent.district,//所在区
        "neighborhood": AddressNew.regeocode.addressComponent.neighborhood,//所在社区
        "neighborhoodType": AddressNew.regeocode.addressComponent.neighborhoodType,//社区类型
        "province": AddressNew.regeocode.addressComponent.province,//省
        "street": AddressNew.regeocode.addressComponent.street,//所在街道
        "streetNumber": AddressNew.regeocode.addressComponent.streetNumber,//门牌号
        "township": AddressNew.regeocode.addressComponent.township,//所在乡镇
        "crosses": "",
        "pois": "",
        "roads": AddressNew.regeocode.roads.name,//道路名称
        "formattedAddress": AddressNew.regeocode.formattedAddress,//格式化地址
    };
    return JSON.stringify(addressParticulars);
};
//此方法初始化页面表格，与reloadData()方法互用，用于平台初始化table，只传入数组，
var getTable;

function getTable(id) {
    getTable = $('#' + id + '').DataTable({
        "destroy": true,
        "dom": 'tiprl',// 自定义显示项
        "lengthChange": true,// 是否允许用户自定义显示数量
        "bPaginate": true, // 翻页功能
        "bFilter": false, // 列筛序功能
        "searching": true,// 本地搜索
        "ordering": false, // 排序功能
        "Info": true,// 页脚信息
        "autoWidth": true,// 自动宽度
        "stripeClasses": [],
        "lengthMenu": [10, 20, 50, 100, 200],
        "pagingType": "full_numbers", // 分页样式
        "dom": "t" + "<'row'<'col-md-3 col-sm-12 col-xs-12'l><'col-md-4 col-sm-12 col-xs-12'i><'col-md-5 col-sm-12 col-xs-12'p>>",
        "oLanguage": {// 国际语言转化
            "oAria": {
                "sSortAscending": " - click/return to sort ascending",
                "sSortDescending": " - click/return to sort descending"
            },
            "sLengthMenu": "显示 _MENU_ 记录",
            "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录。",
            "sZeroRecords": "我本将心向明月，奈何明月照沟渠，不行您再用其他方式查一下？",
            "sEmptyTable": "我本将心向明月，奈何明月照沟渠，不行您再用其他方式查一下？",
            "sLoadingRecords": "正在加载数据-请等待...",
            "sInfoEmpty": "当前显示0到0条，共0条记录",
            "sInfoFiltered": "（数据库中共为 _MAX_ 条记录）",
            "sProcessing": "<img src='../resources/user_share/row_details/select2-spinner.gif'/> 正在加载数据...",
            "sSearch": "模糊查询：",
            "sUrl": "",
            "oPaginate": {
                "sFirst": "首页",
                "sPrevious": " 上一页 ",
                "sNext": " 下一页 ",
                "sLast": " 尾页 "
            },
        },
        "order": [
            [0, null]
        ],
    });
}

//此方法区别于tg_table的ajax请求数据，而是页面请求直接传入数组list，用于页面多表格，或是单表格创建datatable，
function reloadData(dataList) {
    var currentPage = getTable.page()
    getTable.clear()
    getTable.rows.add(dataList)
    getTable.page(currentPage).draw(false);
}
//Ajax下载
function ajax_download_file(url) {
    if (typeof (ajax_download_file.iframe) == "undefined") {
        var iframe = document.createElement("iframe");
        ajax_download_file.iframe = iframe;
        document.body.appendChild(ajax_download_file.iframe);
    }
    ajax_download_file.iframe.src = url;
    ajax_download_file.iframe.style.display = "none";
}
// 判断浏览器
function getBrowserType() {
    var OsObject = "";
    if (navigator.userAgent.indexOf("MSIE") > 0) {
        OsObject = "MSIE";
    }
    if (navigator.userAgent.indexOf("Firefox") > 0) {
        OsObject = "Firefox";
    }
    if (userAgent.indexOf("Safari") > 0 && navigator.userAgent.indexOf("Chrome") < 0) {
        OsObject = "Safari";
    }
    if (navigator.userAgent.indexOf("Chrome") > 0) {
        OsObject = "Chrome";
    }
    return OsObject;
}
// 封装的一个JQuery小插件
jQuery.fn.rowspan = function(colIdx) {
    return this.each(function() {
        var that;
        $('tr', this).each(function(row) {
            $('td:eq(' + colIdx + ')', this).filter(':visible').each(function(col) {
                if (that != null && $(this).html() == $(that).html()) {
                    rowspan = $(that).attr("rowSpan");
                    if (rowspan == undefined) {
                        $(that).attr("rowSpan", 1);
                        rowspan = $(that).attr("rowSpan");
                    }
                    rowspan = Number(rowspan) + 1;
                    $(that).attr("rowSpan", rowspan);
                    $(this).hide();
                } else {
                    that = this;
                }
            });
        });
    });
}

var TG_UTIL = {
    // 计算文件大小
    fileSize : function(size) {
        if (size < 1024) {
            return size + " bytes";
        } else if (size < 1048576) {
            return (Math.round(((size * 10) / 1024)) / 10) + " KB";
        } else {
            return (Math.round(((size * 10) / 1048576)) / 10) + " MB";
        }
    },
    // 去掉字符串头尾空格
    trim : function(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function(fmt) { // author: meizz
    var o = {
        "M+" : this.getMonth() + 1, // 月份
        "d+" : this.getDate(), // 日
        "h+" : this.getHours(), // 小时
        "m+" : this.getMinutes(), // 分
        "s+" : this.getSeconds(), // 秒
        "q+" : Math.floor((this.getMonth() + 3) / 3), // 季度
        "S" : this.getMilliseconds()
    // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for ( var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/**
 * 自定义 jquery validator
 */
// 身份证编码验证
jQuery.validator.addMethod("idCardNum", function(value, element) {
    return this.optional(element) || (IdCardValidate(value));
}, "请填写有效的身份证");
// 手机号验证
jQuery.validator.addMethod("phoneNum", function(value, element) {
    return this.optional(element) || (validatemobile(value));
}, "请输入正确的手机号");

var Wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1 ]; // 加权因子
var ValideCode = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ]; // 身份证验证位值.10代表X
function IdCardValidate(idCard) {
    idCard = TG_UTIL.trim(idCard.replace(/ /g, "")); // 去掉字符串头尾空格
    if (idCard.length == 15) {
        return isValidityBrithBy15IdCard(idCard); // 进行15位身份证的验证
    } else if (idCard.length == 18) {
        var a_idCard = idCard.split(""); // 得到身份证数组
        if (isValidityBrithBy18IdCard(idCard) && isTrueValidateCodeBy18IdCard(a_idCard)) { // 进行18位身份证的基本验证和第18位的验证
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}
/**
 * 判断身份证号码为18位时最后的验证位是否正确
 * 
 * @param a_idCard
 *            身份证号码数组
 * @return
 */
function isTrueValidateCodeBy18IdCard(a_idCard) {
    var sum = 0; // 声明加权求和变量
    if (a_idCard[17].toLowerCase() == 'x') {
        a_idCard[17] = 10; // 将最后位为x的验证码替换为10方便后续操作
    }
    for (var i = 0; i < 17; i++) {
        sum += Wi[i] * a_idCard[i]; // 加权求和
    }
    valCodePosition = sum % 11; // 得到验证码所位置
    if (a_idCard[17] == ValideCode[valCodePosition]) {
        return true;
    } else {
        return false;
    }
}
/**
 * 验证18位数身份证号码中的生日是否是有效生日
 * 
 * @param idCard
 *            18位书身份证字符串
 * @return
 */
function isValidityBrithBy18IdCard(idCard18) {
    var year = idCard18.substring(6, 10);
    var month = idCard18.substring(10, 12);
    var day = idCard18.substring(12, 14);
    var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
    // 这里用getFullYear()获取年份，避免千年虫问题
    if (temp_date.getFullYear() != parseFloat(year) || temp_date.getMonth() != parseFloat(month) - 1 || temp_date.getDate() != parseFloat(day)) {
        return false;
    } else {
        return true;
    }
}
/**
 * 验证15位数身份证号码中的生日是否是有效生日
 * 
 * @param idCard15
 *            15位书身份证字符串
 * @return
 */
function isValidityBrithBy15IdCard(idCard15) {
    var year = idCard15.substring(6, 8);
    var month = idCard15.substring(8, 10);
    var day = idCard15.substring(10, 12);
    var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
    // 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法
    if (temp_date.getYear() != parseFloat(year) || temp_date.getMonth() != parseFloat(month) - 1 || temp_date.getDate() != parseFloat(day)) {
        return false;
    } else {
        return true;
    }
}

function validatemobile(mobile) {
    if (mobile.length == 0 || mobile.length != 11) {
        return false;
    }
    var myreg = /^(((13[0-9]{1})|145|147|(13[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    return myreg.test(mobile);
}

/**
 * 转义文本
 * @param sHtml 需要转义的文本
 * @returns 转义后的文本
 */
function html2Escape(sHtml) { 
	if(!sHtml){
		return "";
	}
	return sHtml.replace(/[<>&"]/g,function(c){
	 return {
		 '<':'&lt;',
		 '>':'&gt;',
		 '&':'&amp;',
		 '"':'&quot;'
		}[c];
	}); 
} 
(function () {
    var $, Calendar, DAYS, DateRangePicker, MONTHS, TEMPLATE, this_pageX, this_pageY, isDegFlag = false, thisPointer,
        isArea, beforeTimeArea, afterTimeArea, thisDay, timepiker;
    var newstartdate = new Date(), newenddate = new Date();
    var defaults = {
        'start_date': '',
        'end_date': '',
        'startdate': '',
        'enddate': '',
        'start_time': '00:00:00',
        'end_time': '23:59:59',
        'isShowHMS': true,//是否显示时分秒
        'type': 'before',
        'timeSelect': '1',
        'isTimeLineClick': false,
        'element': "#inquireClick",
        'imgsrc': "",
        'imgsrchover': ""
    };

    $ = jQuery;

    beforeTimeArea = ['前7天', '前30天', '前90天', '前180天', '前360天', '自定义'];

    afterTimeArea = ['后30天', '后60天', '后1年', '后2年', '后3年', '自定义'];

    DAYS = ['日', '一', '二', '三', '四', '五', '六'];

    MONTHS = ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'];

    TEMPLATE = "<div class=\"drp-popup\">\n  <div class=\"drp-timeline\">\n    <ul class=\"drp-timeline-presets\"></ul>\n    <div class=\"drp-timeline-bar\"></div>\n  </div>\n  <div class=\"drp-calendars\">\n    <div class=\"drp-calendar drp-calendar-start\">\n      <div class=\"drp-month-picker\">\n        <div class=\"drp-arrow\"><</div>\n        <div class=\"drp-month-title\"></div>\n        <div class=\"drp-arrow drp-arrow-right\">></div>\n      </div>\n      <ul class=\"drp-day-headers\"></ul>\n      <ul class=\"drp-days\"></ul>\n <div class='col-md-12' style='top:41px;height: 18px;line-height: 18px;'> <div class=\" col-md-5 drp-calendar-date-text\">开始时间:</div> <input class=\"drp-calendar-date col-md-7\" type='text' style='border: none;background-color: #fff;box-shadow: none;padding-left:0px;'> \n   </div>\n </div>\n    <div class=\"drp-calendar-separator\"></div>\n    <div class=\"drp-calendar drp-calendar-end\">\n      <div class=\"drp-month-picker\">\n        <div class=\"drp-arrow\"><</div>\n        <div class=\"drp-month-title\"></div>\n        <div class=\"drp-arrow drp-arrow-right\">></div>\n      </div>\n      <ul class=\"drp-day-headers\"></ul>\n      <ul class=\"drp-days\"></ul>\n     <div class='col-md-12' style='top:41px;height: 18px;line-height: 18px;'><div class='col-md-5 drp-calendar-date-text'>结束时间:</div> <input class=\"drp-calendar-date col-md-7\" style='border: none;background-color: #fff;box-shadow: none;padding-left:0px;' type='text'>\n  </div>\n  </div>\n  </div>\n  <div class=\"drp-tip\">\n</div><div id='timepikerdiv' style='height:40px;position: relative;top: 37px;border-top:1px solid #e0e0e0;padding-top:10px' class='col-md-12'><div id='timepiker'  type='button' class='col-md-offset-9 col-md-1'></div><div type='button' class='col-md-1' id='savebutton' value='查询' style='margin-left:20px' ></div></div>";

    DateRangePicker = (function () {
        function DateRangePicker($select, opt) {
            defaults = $.extend({}, defaults, opt);
            this.$select = $select;//当前select对象
            this.$dateRangePicker = $(TEMPLATE);//日历插件结构
            //this.$select.attr('tabindex', '-1').before(this.$dateRangePicker);//添加对象
            $('body').after(this.$dateRangePicker);
            this.isHidden = true;
            this.customOptionIndex = this.$select[0].length - 1;
            this.initBindings();
            this.setRange(defaults.timeSelect);
            if (defaults.imgsrc == undefined || defaults.imgsrc == "") {

            } else {
                this.$dateRangePicker.find("#savebutton").css("background-image", defaults.imgsrc);
                this.$dateRangePicker.find("#savebutton").on("mouseover", function () {
                    $(this).css("background-image", defaults.imgsrc);
                })
            }
        }

        DateRangePicker.prototype.initBindings = function () {
            var self;
            self = this;
            //select标签点击事件
            this.$select.on('focus mousedown', function (e) {
                var $select;
                $select = this;
                /* setTimeout(function() {
          return $select.blur();
        }, 0);*/
                // return false;
            });
            //整个日历区域点击事件
            this.$dateRangePicker.click(function (evt) {
                return evt.stopPropagation();
            });
            var newtime;
            $('body').click(function (evt) {

                if (evt.target === self.$select[0] && self.isHidden) {
                    var value = evt.target.value.split('--');
                    var default_start = value[0].split(' ');
                    var default_end = value[1].split(' ');
                    defaults.start_time = default_start[1];
                    defaults.end_time = default_end[1];
                    defaults.start_date = default_start[0];
                    defaults.end_date = default_end[0];
                    var startTime = new Date(value[0].replace(/\-/g, '/')).getTime();
                    var endTime = new Date(value[1].replace(/\-/g, '/')).getTime();
                    var this_day = Math.ceil((endTime - startTime) / 1000 / 24 / 60 / 60);
                    self.setRange(this_day);
                    self.show();
                    var reDateTime = /^(?:19|20)[0-9][0-9]-(?:(?:0[1-9])|(?:1[0-2]))-(?:(?:[0-2][1-9])|(?:[1-3][0-1])) (?:(?:[0-2][0-3])|(?:[0-1][0-9])):[0-5][0-9]:[0-5][0-9]$/;
                    newtime = new timepiker(self);
                    $("#timepiker").unbind().on("click", function () {
//						var _existEle = $(this).parent().find('.ui-laydate.ui-laydate-range.date-theme-molv');
//						if( !_existEle.length){
                        $(this).parent().before(newtime.element);
//						}else{
//							newtime.element = _existEle;
//						}


                        newtime.show(this, self);
                        newtime.hidden = false;
                        newtime.element.find("layui-laydate").css({
                            "position": "relative",
                            "top": "100px"
                        })

                    })

                    self.$dateRangePicker.find(".drp-calendar-date").on("focus", function () {
                        $(this).attr("time", $(this).val());
                    })
                    self.$dateRangePicker.find(".drp-calendar-date").each(function () {
                        $(this).on("change", function () {

                            var isDateTime2 = reDateTime.test($(this).val());
                            // $(this).val($(this).attr("time"));
                            var date1 = self.$dateRangePicker.find(".drp-calendar-date").eq(0).val();
                            var date2 = self.$dateRangePicker.find(".drp-calendar-date").eq(1).val();
                            date1 = new Date(date1);
                            date2 = new Date(date2);
                            var time1 = date1.getTime();
                            var time2 = date2.getTime();
                            if (time1 > time2) {
                                $(this).val($(this).attr("time"));
                                layer.msg("开始时间不能大于结束时间");
                                return
                            } else {
                                if (!isDateTime2) {
                                    $(this).val($(this).attr("time"));
                                } else {
                                    self.$select.val(self.$dateRangePicker.find(".drp-calendar-date").eq(0).val() + "--" + self.$dateRangePicker.find(".drp-calendar-date").eq(1).val())
                                    var value = self.$select.val().split('--');
                                    var default_start = value[0].split(' ');
                                    var default_end = value[1].split(' ');
                                    defaults.start_time = default_start[1];
                                    defaults.end_time = default_end[1];
                                    defaults.start_date = default_start[0];
                                    defaults.end_date = default_end[0];
                                    var startTime = new Date(value[0].replace(/\-/g, '/')).getTime();
                                    var endTime = new Date(value[1].replace(/\-/g, '/')).getTime();
                                    var this_day = Math.ceil((endTime - startTime) / 1000 / 24 / 60 / 60);
                                    self.setRange(this_day);

                                }
                            }
                        })
                    })
                    self.$dateRangePicker.children().find("#savebutton").unbind().on("click", function () {
                    	//点击确认隐藏时间选择框
                    	self.hide();
                        if (defaults.element == "#inquireClick") {

                            //判断日期选择是否有范围限制
                            if (defaults.dateLimit) {
                                var startTime = $(".drp-calendar-start .drp-calendar-date").val();
                                var endTime = $(".drp-calendar-end .drp-calendar-date").val();
                                var curLimit = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 3600 * 24));
                                if (curLimit > (defaults.dateLimit - 1)) {
                                    layer.msg("最多只能查询" + defaults.dateLimit + "天范围的数据！");
                                    return false;
                                }
                                else {
                                    $("#inquireClick").trigger("click");
                                }
                            }
                            else {
                                $("#inquireClick").trigger("click");
                            }
                        } else {
                            $(defaults.element).trigger("click");
                        }
                        newtime.element.remove();

                        return newtime = new timepiker(self);

                    })

                } else if (!self.isHidden) {
                    if (newtime.element) {
                        newtime.element.remove();
                    }
                    return self.hide();
                }
            });
            //初始化日历时间区间选择
            var defaultSelectTime = defaults.timeSelect;
            var calendarType = defaults.type;
            var timeArea;
            if (calendarType == 'before') {
                timeArea = beforeTimeArea;
            } else if (calendarType == 'after') {
                timeArea = afterTimeArea;
            }
            ;
            if (timeArea.indexOf(defaultSelectTime) == -1) {
                defaultSelectTime = '自定义';
            }
            ;
            for (var i = 0; i < timeArea.length; i++) {
                self.$dateRangePicker.find('.drp-timeline-presets').append($("<li class='" + (timeArea[i].indexOf(defaultSelectTime) != -1 ? 'drp-selected' : '') + "'>" + (timeArea[i]) + "<div class='drp-button'></div></li>"));
            }
            /*this.$select.children().each(function() {
        //初始化日历时间区间选择
        return self.$dateRangePicker.find('.drp-timeline-presets').append($("<li class='" + ((this.selected && 'drp-selected') || '') + "'>" + ($(this).text()) + "<div class='drp-button'></div></li>"));
      });*/
            //时间区间选择点击事件
            return this.$dateRangePicker.find('.drp-timeline-presets li').click(function (evt) {
                defaults.start_date = '';
                defaults.end_date = '';
                defaults.isTimeLineClick = true;
                var presetIndex;
                $(this).addClass('drp-selected').siblings().removeClass('drp-selected');//添加高亮
                presetIndex = $(this).index();
                self.$select[0].selectedIndex = presetIndex;
                self.setRange(self.number(presetIndex));
                if (presetIndex === self.customOptionIndex) {
                    return self.showCustomDate();
                }
            });


        };

        DateRangePicker.prototype.number = function (index) {
            var value;
            if (defaults.type === 'before') {
                if (index == 0) {
                    value = 7;
                }
                ;
                if (index == 1) {
                    value = 30;
                }
                ;
                if (index == 2) {
                    value = 90;
                }
                ;
                if (index == 3) {
                    value = 180;
                }
                ;
                if (index == 4) {
                    value = 360;
                }
                ;
            } else if (defaults.type === 'after') {
                if (index == 0) {
                    value = 30;
                }
                ;
                if (index == 1) {
                    value = 60;
                }
                ;
                if (index == 2) {
                    value = 365;
                }
                ;
                if (index == 3) {
                    value = 730;
                }
                ;
                if (index == 4) {
                    value = 1095;
                }
                ;
            }
            return value;
        };

        DateRangePicker.prototype.hide = function () {
            this.isHidden = true;
            return this.$dateRangePicker.hide();
        };

        DateRangePicker.prototype.show = function () {
            this.isHidden = false;
            return this.$dateRangePicker.show();
        };

        DateRangePicker.prototype.showCustomDate = function () {
            var text;
            this.$dateRangePicker.find('.drp-timeline-presets li:last-child').addClass('drp-selected').siblings().removeClass('drp-selected');
            text = this.formatDate(this.startDate()) + ' - ' + this.formatDate(this.endDate());
            this.$select.find('option:last-child').text(text);
            return this.$select[0].selectedIndex = this.customOptionIndex;
        };

        DateRangePicker.prototype.formatDate = function (d) {
            return "" + (d.getMonth() + 1) + "/" + (d.getDate()) + "/" + (d.getFullYear().toString().substr(2, 2));
        };
        //根据选择的时间区间日历区域进行变化
        DateRangePicker.prototype.setRange = function (daysAgo) {
            var endDate, startDate;
            if (isNaN(daysAgo)) {
                return false;
            }
            var calendarType = defaults.type;
            if (defaults.start_date == '' && defaults.end_date == '') {
                daysAgo -= 1;
                endDate = new Date();
                startDate = new Date();
                if (calendarType == 'before') {
                    startDate.setDate(endDate.getDate() - daysAgo);//给开始日历设置日期(置前)
                } else if (calendarType == 'after') {
                    endDate.setDate(endDate.getDate() + daysAgo);
                }
                ;
            } else {
                daysAgo -= 1;
                endDate = new Date(defaults.end_date.replace(/\-/g, '/'));
                startDate = new Date(defaults.start_date.replace(/\-/g, '/'));
            }
            ;
            this.startCalendar = new Calendar(this, this.$dateRangePicker.find('.drp-calendar:first-child'), startDate, true);
            this.endCalendar = new Calendar(this, this.$dateRangePicker.find('.drp-calendar:last-child'), endDate, false);
            return this.draw();
        };

        DateRangePicker.prototype.endDate = function () {
            return this.endCalendar.date;
        };

        DateRangePicker.prototype.startDate = function () {
            return this.startCalendar.date;
        };

        DateRangePicker.prototype.draw = function () {
            this.startCalendar.draw();
            return this.endCalendar.draw();
        };

        return DateRangePicker;

    })();

    Calendar = (function () {
        //初始化日历
        function Calendar(dateRangePicker, $calendar, date, isStartCalendar) {
            var self;
            this.dateRangePicker = dateRangePicker;
            this.$calendar = $calendar;//当前日历对象
            this.date = date;//当前日期
            this.isStartCalendar = isStartCalendar;
            self = this;
            this.date.setHours(0, 0, 0, 0);//设置指定时间的小时字段
            this._visibleMonth = this.month();//当前月份
            this._visibleYear = this.year();//当前年份
            this.$title = this.$calendar.find('.drp-month-title');//当前显示年月的div标签
            this.$dayHeaders = this.$calendar.find('.drp-day-headers');//当前显示星期的ul标签
            this.$days = this.$calendar.find('.drp-days');//当前显示日期的ul标签
            this.$dateDisplay = this.$calendar.find('.drp-calendar-date');//底部显示详细时间的div标签
            //切换年月点击事件
            $calendar.find('.drp-arrow').click(function (evt) {
                if ($(this).hasClass('drp-arrow-right')) {
                    self.showNextMonth();
                } else {
                    self.showPreviousMonth();
                }
                return false;
            });
        }

        Calendar.prototype.showPreviousMonth = function () {
            if (this._visibleMonth === 1) {
                this._visibleMonth = 12;
                this._visibleYear -= 1;
            } else {
                this._visibleMonth -= 1;
            }
            return this.draw();
        };

        Calendar.prototype.showNextMonth = function () {
            if (this._visibleMonth === 12) {
                this._visibleMonth = 1;
                this._visibleYear += 1;
            } else {
                this._visibleMonth += 1;
            }
            return this.draw();
        };

        Calendar.prototype.setDay = function (day) {
            this.setDate(this.visibleYear(), this.visibleMonth(), day);
            return this.dateRangePicker.showCustomDate();
        };

        Calendar.prototype.setDate = function (year, month, day) {

            this.date = new Date(year, month - 1, day);
            if (this.$dateDisplay.parent().parent().hasClass('drp-calendar-start')) {
                // this_time = defaults.start_time;
                if (this.date) {
                    newstartdate = this.date;

                }
            } else if (this.$dateDisplay.parent().parent().hasClass('drp-calendar-end')) {
                this_time = defaults.end_time;
                if (this.date) {
                    newenddate = this.date;
                }
            }
            return this.dateRangePicker.draw();
        };

        Calendar.prototype.draw = function () {
            var day, _i, _len;
            this.$dayHeaders.empty();//移除星期标签
            this.$title.text("" + (this.nameOfMonth(this.visibleMonth())) + " " + (this.visibleYear()));//移入年月
            //移入星期
            for (_i = 0, _len = DAYS.length; _i < _len; _i++) {
                day = DAYS[_i];
                this.$dayHeaders.append($("<li>" + (day.substr(0, 2)) + "</li>"));
            }
            this.drawDateDisplay();
            var start_time = this.dateRangePicker.$dateRangePicker.find('.drp-calendar-start .drp-calendar-date').val();
            var end_time = this.dateRangePicker.$dateRangePicker.find('.drp-calendar-end .drp-calendar-date').val();
            this.dateRangePicker.$select.val(start_time + '--' + end_time);
            return this.drawDays();
        };

        Calendar.prototype.dateIsSelected = function (date) {
            return date.getTime() === this.date.getTime();
        };

        //当前日期高亮
        Calendar.prototype.dateIsSame = function (date) {
            var NowDate = new Date();
            var y = NowDate.getFullYear();
            var m = NowDate.getMonth() + 1;
            var d = NowDate.getDate();
            var time = y + '/' + m + '/' + d;
            return new Date(time).getTime() === date.getTime();
        };

        Calendar.prototype.dateIsInRange = function (date) {
            return date >= this.dateRangePicker.startDate() && date <= this.dateRangePicker.endDate();
        };

        Calendar.prototype.dayClass = function (day, firstDayOfMonth, lastDayOfMonth) {
            var classes, date;
            date = new Date(this.visibleYear(), this.visibleMonth() - 1, day);
            classes = '';
            if (this.dateIsSelected(date)) {
                classes += ' drp-day-selected';
            } else if (this.dateIsInRange(date)) {
                classes += ' drp-day-in-range';
                if (date.getTime() === this.dateRangePicker.endDate().getTime()) {
                    classes += ' drp-day-last-in-range';
                }
            } else if (this.isStartCalendar) {
                if (date > this.dateRangePicker.endDate()) {
                    classes += ' drp-day-disabled';
                }
            } else if (date < this.dateRangePicker.startDate()) {
                classes += ' drp-day-disabled';
            }
            if ((day + firstDayOfMonth - 1) % 7 === 0 || day === lastDayOfMonth) {
                classes += ' drp-day-last-in-row';
            }
            if (this.dateIsSame(date)) {
                classes += ' drp-day-highLight'
            }
            ;
            return classes;
        };

        Calendar.prototype.drawDays = function () {
            //移入当前月所有日期
            var firstDayOfMonth, i, lastDayOfMonth, self, _i, _j, _ref;
            self = this;
            this.$days.empty();//先移除日期
            firstDayOfMonth = this.firstDayOfMonth(this.visibleMonth(), this.visibleYear());
            lastDayOfMonth = this.daysInMonth(this.visibleMonth(), this.visibleYear());
            for (i = _i = 1, _ref = firstDayOfMonth - 1; _i <= _ref; i = _i += 1) {
                this.$days.append($("<li class='drp-day drp-day-empty'></li>"));
            }
            for (i = _j = 1; _j <= lastDayOfMonth; i = _j += 1) {
                this.$days.append($("<li class='drp-day " + (this.dayClass(i, firstDayOfMonth, lastDayOfMonth)) + "'>" + i + "</li>"));
            }
            this.$calendar.find('.drp-day').mousedown(function (evt) {
                defaults.isTimeLineClick = false;
                var $this = $(this);
                if ($this.hasClass('drp-day-empty')) {
                    return false
                }
                ;
                if (defaults.isShowHMS && !$this.hasClass('drp-day-disabled')) {
                    thisDay = parseInt($(this).text(), 10);
                    //日期点击事件
                    isDegFlag = true;
                    $this.css("overflow", "visible").append('<div class="at12"><div class="pointer"></div></div>');
                    thisPointer = $this.find(".pointer");
                    this_pageX = evt.pageX;
                    this_pageY = evt.pageY;
                    var this_time;
                    if ($this.parent().parent().hasClass('drp-calendar-start')) {
                        this_time = defaults.start_time;
                        isArea = 0;//开始
                    } else if ($this.parent().parent().hasClass('drp-calendar-end')) {
                        this_time = defaults.end_time;
                        isArea = 1;//结束
                    }
                    ;
                    thisPointer.parent('div').parent('li').attr("data-settime", this_time);
                    var this_time_array = this_time.split(':');
                    var this_hour = parseInt(this_time_array[0]);
                    var this_deg = 360 / 23 * this_hour;
                    thisPointer.css({
                        "transform": "rotate(" + (this_deg - 90) + "deg)"
                    });
                }
            }).mouseup(function (evt) {
                isDegFlag = false;
                var day;
                if ($(this).hasClass('drp-day-disabled')) {
                    return false;
                }
                day = parseInt($(this).text(), 10);
                if (isNaN(day)) {
                    return false;
                }
                return self.setDay(day);
            });
            //转动转盘
            $(document).mousemove(function (e) {

                if (isDegFlag) {
                    var poorY = parseInt((e.pageY - this_pageY) / 10);
                    var poorX = parseInt((e.pageX - this_pageX) / 10);
                    if (Math.abs(poorY) > 1 || Math.abs(poorX) > 1) {
                        var S = (e.pageX - this_pageX);
                        var X = (this_pageY - e.pageY);
                        var T = 90 / Math.atan(1 / 0);
                        var P = Math.atan(S / X) * T;
                        if (X < 0 && S > 0) {
                            P = 180 + P;
                        }
                        ;
                        if (X < 0 && S <= 0) {
                            P = 180 + P;
                        }
                        ;
                        if (X >= 0 && S < 0) {
                            P = 360 + P;
                        }
                        ;
                        var this_time;
                        if (isArea == 0) {
                            this_time = defaults.start_time;
                        } else if (isArea == 1) {
                            this_time = defaults.end_time;
                        }
                        ;
                        var this_time_array = this_time.split(':');
                        for (var i = 0; i < this_time_array.length; i++) {
                            this_time_array[i] = parseInt(this_time_array[i]);
                        }
                        ;
                        var this_hour;
                        var this_minutes;
                        var this_seconds;
                        if (Math.abs(poorY) > 11 || Math.abs(poorX) > 11) {
                            thisPointer.parent("div").attr("class", "at36");
                            this_seconds = Math.round(59 * P / 360);
                            this_time_array[2] = this_seconds;
                        } else if ((Math.abs(poorY) > 5 && Math.abs(poorY) < 12) || (Math.abs(poorX) > 5 && Math.abs(poorX) < 12)) {
                            thisPointer.parent("div").attr("class", "at24");
                            this_minutes = Math.round(59 * P / 360);
                            this_time_array[1] = this_minutes;
                        } else {
                            thisPointer.parent("div").attr("class", "at12");
                            this_hour = Math.round(23 * P / 360);
                            this_time_array[0] = this_hour;
                        }
                        ;


                        var timeString = (this_time_array[0] < 10 ? '0' + this_time_array[0] : this_time_array[0]) + ':' + (this_time_array[1] < 10 ? '0' + this_time_array[1] : this_time_array[1]) + ':' + (this_time_array[2] < 10 ? '0' + this_time_array[2] : this_time_array[2]);
                        if (isArea == 0) {
                            defaults.start_time = timeString;
                        } else if (isArea == 1) {
                            defaults.end_time = timeString;
                        }
                        ;

                        //this.dateRangePicker.checktime();
                        thisPointer.parent('div').parent('li').attr("data-settime", timeString);
                        thisPointer.css({
                            "transform": "rotate(" + (P - 90) + "deg)"
                        });
                    }
                    ;
                }
                ;
            }).mouseup(function () {
                if (isDegFlag) {
                    isDegFlag = false;
                    return self.setDay(thisDay);
                }
                ;
            });
        };

        //判断所选时间范围（相差几天）
        Calendar.prototype.differentDaysByMillisecond = function (date1, date2) {
            days = ((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));
            return Math.floor(days);
        };
        Calendar.prototype.drawDateDisplay = function () {

            //底部时间赋值
            var this_time = '';
            if (defaults.isShowHMS) {
                if (this.$dateDisplay.parent().parent().hasClass('drp-calendar-start')) {
                    this_time = defaults.start_time;

                    //判断是否需要判断日期范围
                    if (defaults.dateLimit) {
                        var curLimit = this.differentDaysByMillisecond(newstartdate, newenddate);
                        if (curLimit > (defaults.dateLimit - 1)) {
                            layer.msg("最多只能查询" + defaults.dateLimit + "天范围的数据！");
                            return false;
                        }
                    }

                    if (this.dateRangePicker.formatDate(newstartdate).substring(0, 11) == this.dateRangePicker.formatDate(newenddate).substring(0, 11)) {
                        if (this.changetime(defaults.start_time) >= this.changetime(defaults.end_time)) {
                            layer.msg("开始时间不能大于结束时间");
                            newstartdate = new Date(this.$dateDisplay.val());
                            return false;
                        } else {
                            return this.$dateDisplay.val([this.year() < 10 ? '0' + this.year() : this.year(), this.month() < 10 ? '0' + this.month() : this.month(), this.day() < 10 ? '0' + this.day() : this.day()].join('-') + ' ' + this_time);

                        }

                    }
                    else {
                        return this.$dateDisplay.val([this.year() < 10 ? '0' + this.year() : this.year(), this.month() < 10 ? '0' + this.month() : this.month(), this.day() < 10 ? '0' + this.day() : this.day()].join('-') + ' ' + this_time);

                    }

                } else if (this.$dateDisplay.parent().parent().hasClass('drp-calendar-end')) {
                    this_time = defaults.end_time;

                    if (this.dateRangePicker.formatDate(newstartdate).substring(0, 11) == this.dateRangePicker.formatDate(newenddate).substring(0, 11)) {
                        if (this.changetime(defaults.start_time) >= this.changetime(defaults.end_time)) {
                            layer.msg("开始时间不能大于结束时间")
                            newenddate = new Date(this.$dateDisplay.val());
                            return false;
                        } else {
                            return this.$dateDisplay.val([this.year() < 10 ? '0' + this.year() : this.year(), this.month() < 10 ? '0' + this.month() : this.month(), this.day() < 10 ? '0' + this.day() : this.day()].join('-') + ' ' + this_time);

                        }

                    } else {
                        return this.$dateDisplay.val([this.year() < 10 ? '0' + this.year() : this.year(), this.month() < 10 ? '0' + this.month() : this.month(), this.day() < 10 ? '0' + this.day() : this.day()].join('-') + ' ' + this_time);

                    }

                }
                ;
            }
            ;

            //if(!defaults.isTimeLineClick){
            //};
        };

        Calendar.prototype.month = function () {
            return this.date.getMonth() + 1;
        };

        Calendar.prototype.day = function () {
            return this.date.getDate();
        };

        Calendar.prototype.dayOfWeek = function () {
            return this.date.getDay() + 1;
        };

        Calendar.prototype.year = function () {
            return this.date.getFullYear();
        };

        Calendar.prototype.visibleMonth = function () {
            return this._visibleMonth;
        };

        Calendar.prototype.visibleYear = function () {
            return this._visibleYear;
        };

        Calendar.prototype.nameOfMonth = function (month) {
            return MONTHS[month - 1];
        };

        Calendar.prototype.firstDayOfMonth = function (month, year) {
            return new Date(year, month - 1, 1).getDay() + 1;
        };

        Calendar.prototype.daysInMonth = function (month, year) {
            month || (month = this.visibleMonth());
            year || (year = this.visibleYear());
            return new Date(year, month, 0).getDate();
        };
        Calendar.prototype.changetime = function (time) {
            var time = time.split(":");
            return parseInt(time[0]) * 3600 + parseInt(time[1]) * 60 + parseInt(time[2]);
        }
        return Calendar;

    })();

    timepiker = (function () {
        function timepiker(lastelement) {
            var that = this;
            var element = "<div class='ui-laydate ui-laydate-range date-theme-molv' style='border:1px solid #d2d2d2;height:325px'>" +
                "<div class='ui-laydate-main date-main-list-0 date-time-show' style='float:left'>" +
                "<div class='ui-laydate-header'>" +
                "<div class='date-set-ym'>" +
                "<span class='date-time-text'>开始时间</span>" +
                "</div>" +
                "</div>" +
                "<div class='ui-laydate-content' style='background-color:#fff;height:232px'>" +
                '<ul class="ui-laydate-list date-time-list" style="padding:10px" >' +
                '<li class="timepicker-hour"><p>时</p><ol><li class="ui-this">00</li><li class="">01</li><li class="">02</li><li class="">03</li><li class="">04</li><li class="">05</li><li class="">06</li><li class="">07</li><li class="">08</li><li class="">09</li><li class="">10</li><li class="">11</li><li class="">12</li><li class="">13</li><li class="">14</li><li class="">15</li><li class="">16</li><li class="">17</li><li class="">18</li><li class="">19</li><li class="">20</li><li class="">21</li><li class="">22</li><li class="">23</li></ol></li>' +
                '<li class="timepicker-minite"><p>分</p><ol><li class="ui-this">00</li><li class="">01</li><li class="">02</li><li class="">03</li><li class="">04</li><li class="">05</li><li class="">06</li><li class="">07</li><li class="">08</li><li class="">09</li><li class="">10</li><li class="">11</li><li class="">12</li><li class="">13</li><li class="">14</li><li class="">15</li><li class="">16</li><li class="">17</li><li class="">18</li><li class="">19</li><li class="">20</li><li class="">21</li><li class="">22</li><li class="">23</li><li class="">24</li><li class="">25</li><li class="">26</li><li class="">27</li><li class="">28</li><li class="">29</li><li class="">30</li><li class="">31</li><li class="">32</li><li class="">33</li><li class="">34</li><li class="">35</li><li class="">36</li><li class="">37</li><li class="">38</li><li class="">39</li><li class="">40</li><li class="">41</li><li class="">42</li><li class="">43</li><li class="">44</li><li class="">45</li><li class="">46</li><li class="">47</li><li class="">48</li><li class="">49</li><li class="">50</li><li class="">51</li><li class="">52</li><li class="">53</li><li class="">54</li><li class="">55</li><li class="">56</li><li class="">57</li><li class="">58</li><li class="">59</li></ol></li>' +
                '<li class="timepicker-seconds"><p>秒</p><ol><li class="ui-this">00</li><li class="">01</li><li class="">02</li><li class="">03</li><li class="">04</li><li class="">05</li><li class="">06</li><li class="">07</li><li class="">08</li><li class="">09</li><li class="">10</li><li class="">11</li><li class="">12</li><li class="">13</li><li class="">14</li><li class="">15</li><li class="">16</li><li class="">17</li><li class="">18</li><li class="">19</li><li class="">20</li><li class="">21</li><li class="">22</li><li class="">23</li><li class="">24</li><li class="">25</li><li class="">26</li><li class="">27</li><li class="">28</li><li class="">29</li><li class="">30</li><li class="">31</li><li class="">32</li><li class="">33</li><li class="">34</li><li class="">35</li><li class="">36</li><li class="">37</li><li class="">38</li><li class="">39</li><li class="">40</li><li class="">41</li><li class="">42</li><li class="">43</li><li class="">44</li><li class="">45</li><li class="">46</li><li class="">47</li><li class="">48</li><li class="">49</li><li class="">50</li><li class="">51</li><li class="">52</li><li class="">53</li><li class="">54</li><li class="">55</li><li class="">56</li><li class="">57</li><li class="">58</li><li class="">59</li></ol>' +
                '</li>' +
                '</ul>' +
                "</div>" +
                "</div>" +
                "<div class='ui-laydate-main date-main-list-1 date-time-show' style='float:left'>" +
                "<div class='ui-laydate-header'>" +
                "<div class='date-set-ym'>" +
                "<span class='date-time-text'>结束时间</span>" +
                "</div>" +
                "</div>" +
                "<div class='ui-laydate-content' style='background-color:#fff;height:232px'>" +
                '<ul class="ui-laydate-list date-time-list" style="padding:10px">' +
                '<li class="timepicker-hour2"><p>时</p><ol><li class="ui-this">00</li><li class="">01</li><li class="">02</li><li class="">03</li><li class="">04</li><li class="">05</li><li class="">06</li><li class="">07</li><li class="">08</li><li class="">09</li><li class="">10</li><li class="">11</li><li class="">12</li><li class="">13</li><li class="">14</li><li class="">15</li><li class="">16</li><li class="">17</li><li class="">18</li><li class="">19</li><li class="">20</li><li class="">21</li><li class="">22</li><li class="">23</li></ol></li>'
                + '<li class="timepicker-minite2"><p>分</p><ol><li class="ui-this">00</li><li class="">01</li><li class="">02</li><li class="">03</li><li class="">04</li><li class="">05</li><li class="">06</li><li class="">07</li><li class="">08</li><li class="">09</li><li class="">10</li><li class="">11</li><li class="">12</li><li class="">13</li><li class="">14</li><li class="">15</li><li class="">16</li><li class="">17</li><li class="">18</li><li class="">19</li><li class="">20</li><li class="">21</li><li class="">22</li><li class="">23</li><li class="">24</li><li class="">25</li><li class="">26</li><li class="">27</li><li class="">28</li><li class="">29</li><li class="">30</li><li class="">31</li><li class="">32</li><li class="">33</li><li class="">34</li><li class="">35</li><li class="">36</li><li class="">37</li><li class="">38</li><li class="">39</li><li class="">40</li><li class="">41</li><li class="">42</li><li class="">43</li><li class="">44</li><li class="">45</li><li class="">46</li><li class="">47</li><li class="">48</li><li class="">49</li><li class="">50</li><li class="">51</li><li class="">52</li><li class="">53</li><li class="">54</li><li class="">55</li><li class="">56</li><li class="">57</li><li class="">58</li><li class="">59</li></ol></li>'
                + '<li class="timepicker-seconds2"><p>秒</p><ol><li class="ui-this">00</li><li class="">01</li><li class="">02</li><li class="">03</li><li class="">04</li><li class="">05</li><li class="">06</li><li class="">07</li><li class="">08</li><li class="">09</li><li class="">10</li><li class="">11</li><li class="">12</li><li class="">13</li><li class="">14</li><li class="">15</li><li class="">16</li><li class="">17</li><li class="">18</li><li class="">19</li><li class="">20</li><li class="">21</li><li class="">22</li><li class="">23</li><li class="">24</li><li class="">25</li><li class="">26</li><li class="">27</li><li class="">28</li><li class="">29</li><li class="">30</li><li class="">31</li><li class="">32</li><li class="">33</li><li class="">34</li><li class="">35</li><li class="">36</li><li class="">37</li><li class="">38</li><li class="">39</li><li class="">40</li><li class="">41</li><li class="">42</li><li class="">43</li><li class="">44</li><li class="">45</li><li class="">46</li><li class="">47</li><li class="">48</li><li class="">49</li><li class="">50</li><li class="">51</li><li class="">52</li><li class="">53</li><li class="">54</li><li class="">55</li><li class="">56</li><li class="">57</li><li class="">58</li><li class="">59</li></ol></li></ul>'
                + "</div>"
                + "</div>"
                + '<div class="ui-laydate-footer"><span lay-type="datetime" class="date-btns-time"></span><div class="date-footer-btns"><span lay-type="confirm" class="date-btns-cancel">取消</span><span lay-type="confirm" class="date-btns-confirm">确定</span></div></div>'
                + "</div>";
            this.element = $(element);
            this.element.click(function (evt) {
                return evt.stopPropagation();
            });
            this.hidden = true;

            function time(h, m, s) {
                this.h = h;
                this.m = m;
                this.s = s;
            }

            var time1 = new time("00", "00", "00");
            var time2 = new time("00", "00", "00");
            that.startime = time1.h + ":" + time1.m + ":" + time1.s;
            that.endtime = time2.h + ":" + time2.m + ":" + time2.s;
            this.element.click(function (evt) {
                return evt.stopPropagation();
            });
            /*	  this.element.find(".ui-laydate-list").find("ol").each(function(){
             $(this). find("li").each(function(){
                 $(this).unbind().on("click",function(){
                     $(this).siblings().removeClass("ui-this");
                        $(this).addClass("ui-this");
                 })
          })})*/
            this.element.unbind().on("click", function (evt) {
                if (evt.target.className === "date-btns-confirm") {

                    that.confirm(that, lastelement);
                } else if (evt.target.localName == "li") {
                    var dd = $(evt.target).parent().parent().parent().hasClass("ui-laydate-list");
                    if (dd) {
                        $(evt.target).siblings().removeClass("ui-this");
                        $(evt.target).addClass("ui-this");
                    }


                } else if (evt.target.className === "date-btns-cancel") {
                    that.hide(that, lastelement);
                }
            })


        }

        timepiker.prototype.confirm = function (that, lastelement) {
            var timelist = [];
            $(".ui-this").each(function () {
                timelist.push($(this).text());
            })
            defaults.start_time = timelist[0] + ":" + timelist[1] + ":" + timelist[2];
            defaults.end_time = timelist[3] + ":" + timelist[4] + ":" + timelist[5];
            var startdate = lastelement.$dateRangePicker.find(".drp-calendar-date").eq(0).val().substring(0, 11);
            var enddate = lastelement.$dateRangePicker.find(".drp-calendar-date").eq(1).val().substring(0, 11);
            var date1 = startdate + "" + timelist[0] + ":" + timelist[1] + ":" + timelist[2];
            var date2 = enddate + "" + timelist[3] + ":" + timelist[4] + ":" + timelist[5];

            //layer.msg('开始时间不能大于结束时间');
            if (date1 >= date2) {
                layer.msg('开始时间不能大于结束时间');
                return;
            }
            defaults.startdate = date1;
            defaults.enddate = date2;

            lastelement.$dateRangePicker.find(".drp-calendar-date").eq(0).val(date1)
            lastelement.$dateRangePicker.find(".drp-calendar-date").eq(1).val(date2)
            lastelement.$select.val(defaults.startdate + "--" + defaults.enddate);
            this.hide();
        }

        timepiker.prototype.hide = function (that, lastelement) {

            this.element.hide();
        }

        timepiker.prototype.show = function (that, lastelement) {
            var _total = lastelement.$select.val().split('--');

            var _startTime = _total[0].split(' ')[1].split(':');
            var _endTime = _total[1].split(' ')[1].split(':');
            var _time = _startTime.concat(_endTime);

            var hour, minite, seconds, hour2, minite2, seconds2;
            hour = lastelement.$dateRangePicker.find('.timepicker-hour');
            minite = lastelement.$dateRangePicker.find('.timepicker-minite');
            seconds = lastelement.$dateRangePicker.find('.timepicker-seconds');
            hour2 = lastelement.$dateRangePicker.find('.timepicker-hour2');
            minite2 = lastelement.$dateRangePicker.find('.timepicker-minite2');
            seconds2 = lastelement.$dateRangePicker.find('.timepicker-seconds2');

            var eleArray = [hour, minite, seconds, hour2, minite2, seconds2];
            for (var i = 0; i < eleArray.length; i++) {
                eleArray[i].find('li').removeClass('ui-this').each(function (index, ele) {
                    var $ele = $(ele);
                    if ($ele.html() == _time[i]) {
                        $ele.addClass('ui-this');
                        eleArray[i].find('ol').animate({
                            scrollTop: (index * 30)
                        })
                        return false;
                    }
                })
            }

            this.element.show();
            //newtime=new timepiker(self);
        }


        return timepiker;
    })();
    $.fn.dateRangePicker = function (options) {
        return new DateRangePicker(this, options);
    };

}).call(this);
/**
 * Created by Tdz on 2016-11-24.
 */
function json_ajax(type,url,dataType,async,data,callback){
    $.ajax(
        {
            type:type,//通常会用到两种：GET,POST。默认是：GET
            url:url,//(默认: 当前页地址) 发送请求的地址
            dataType:dataType, //预期服务器返回的数据类型。"json"
            async:async, // 异步同步，true  false
            data:data,
            timeout : 30000, //超时时间设置，单位毫秒
            beforeSend:beforeSend, //发送请求
            success:callback, //请求成功
            error:error,//请求出错
            complete:complete//请求完成
        });
}
function ajax_submit(type,url,dataType,async,data,traditional,callback){
    $.ajax(
        {
            type:type,//通常会用到两种：GET,POST。默认是：GET
            url:url,//(默认: 当前页地址) 发送请求的地址
            dataType:dataType, //预期服务器返回的数据类型。"json"
            async:async, // 异步同步，true  false
            data:data,
            traditional:traditional,
            timeout : 30000, //超时时间设置，单位毫秒
            beforeSend:beforeSend, //发送请求
            success:callback, //请求成功
            error:error,//请求出错
            complete:complete//请求完成
        });
}
//逆地理编码专用ajax
function address_submit(type,url,dataType,async,data,traditional,callback){
    $.ajax(
        {
            type:type,//通常会用到两种：GET,POST。默认是：GET
            url:url,//(默认: 当前页地址) 发送请求的地址
            dataType:dataType, //预期服务器返回的数据类型。"json"
            async:async, // 异步同步，true  false
            data:data,
            traditional:traditional,
            timeout : 30000, //超时时间设置，单位毫秒
            success:callback, //请求成功
            error:error,//请求出错
        });
}

function json_ajax_p(type,url,dataType,async,data,callback){
    $.ajax(
        {
            type:type,//通常会用到两种：GET,POST。默认是：GET
            url:url,//(默认: 当前页地址) 发送请求的地址
            dataType:dataType, //预期服务器返回的数据类型。"json"
            async:async, // 异步同步，true  false
            data:data,
            timeout : 30000, //超时时间设置，单位毫秒
            // beforeSend:beforeSend, //发送请求
            success:callback, //请求成功
            error:error,//请求出错
            // complete:complete//请求完成
        });
}

//支持Form方式excel导出
function exportExcelUseForm(url,params) {
	var form = $('<form method="POST" action="' + url + '">');
    $.each(params, function (k, v) {
        form.append($('<input type="hidden" name="' + k +
            '" value="' + v + '">'));
    });
    $('body').append(form);
    form.submit(); //自动提交
}



//支持post方式excel导出
function exportExcelUsePost(url,params) {
    $.ajax({
        type: "POST",
        url: url,
        data: params,
        success: function (response, status, request) {
            var disp = request.getResponseHeader('Content-Disposition');
            if (disp && disp.search('attachment') != -1) {  //判断是否为文件
                var form = $('<form method="POST" action="' + url + '">');
                $.each(params, function (k, v) {
                    form.append($('<input type="hidden" name="' + k +
                        '" value="' + v + '">'));
                });
                $('body').append(form);
                form.submit(); //自动提交
            }
        },
        beforeSend:beforeSend, //发送请求
        error:error,//请求出错
        complete:complete//请求完成
    })
}


function error(XMLHttpRequest, textStatus, errorThrown){
    layer.closeAll('loading');
    if(textStatus === "timeout"){
        layer.msg("加载超时，请重试");
        return;
    }
    if (XMLHttpRequest.responseText.indexOf("<form id=\"loginForm") > 0) {
        window.location.replace("/login?type=expired");
        return;
    }
    layer.msg("系统的情绪不稳定，并向你扔了一个错误~");
}


function beforeSend(XMLHttpRequest){
    
    var csrftoken = getCookie('csrftoken');
    console.log('beforeSend?sdf',csrftoken);
    XMLHttpRequest.setRequestHeader("X-CSRFToken", csrftoken);
    
    layer.load(2);
}
function complete(XMLHttpRequest, textStatus){
    layer.closeAll('loading');
}

//逆地理编码 -- 解析两个经纬度一组的数据
var startAddress, endAddress, pushIndex = 1;
function backAddressMsg(index,addressLngLat,goBackMsg,addressArray){
  var arrayIndex = index;
  $.ajax(
    {
      type:"POST",
      url:"/clbs/v/monitoring/getAddress",
      dataType:"json",
      async:true,
      data:{lnglatXYs:addressLngLat[index]},
      traditional:true,
      timeout : 30000,
      success:function(data){
    	  var carAddress = data;
    	  if(carAddress == "AddressNull"){
    	      var geocoder = new AMap.Geocoder({
    	          radius: 1000,
    	          extensions: "base"
    	      });
    	      geocoder.getAddress(addressLngLat[index]);
    	      AMap.event.addListener(geocoder,"complete",function(GeocoderResult){
    	        arrayIndex++;
    	        if(pushIndex == 1){
    	          if(GeocoderResult.info == 'NO_DATA'){
    	        	  startAddress = '未定位';
    	          }else{
    	        	  startAddress = GeocoderResult.regeocode.formattedAddress;
    	          };
    	          pushIndex++;
    	        }else{
	        	  if(GeocoderResult.info == 'NO_DATA'){
	        		  endAddress = '未定位';
       	          }else{
       	        	endAddress = GeocoderResult.regeocode.formattedAddress;
       	          };
    	          addressArray.push([startAddress, endAddress]);
    	          startAddress = null;
    	          endAddress == null;
    	          pushIndex = 1;
    	        }
    	        if(startAddress != '未定位' && endAddress != '未定位'){
    	        	var addressParticulars = getaddressParticulars(GeocoderResult,addressLngLat[index][0],addressLngLat[index][1]);
        	        $.ajax({
                    	type:"POST",
                        url:"/clbs/v/monitoring/setAddress",
                        dataType:"json",
                        async:true,
                        data:{"addressNew" : addressParticulars},
                        traditional:false,
                        timeout : 30000,
                    });
    	        };
    	        if(arrayIndex < addressLngLat.length){
    	          backAddressMsg(arrayIndex,addressLngLat,goBackMsg,addressArray);
    	        }else{
    	          return goBackMsg(addressArray);
    	        }
    	      });
    	  }else{
    	    arrayIndex++;
    	    if(pushIndex == 1){
    	      startAddress = carAddress;
    	      pushIndex++;
    	    }else{
    	      endAddress = carAddress;
    	      addressArray.push([startAddress, endAddress]);
    	      startAddress = null;
    	        endAddress == null;
    	        pushIndex = 1;
    	    };
	        if(arrayIndex < addressLngLat.length){
	          backAddressMsg(arrayIndex,addressLngLat,goBackMsg,addressArray);
	        }else{
	          return goBackMsg(addressArray);
	        }
    	  }
      },
  });
}
//逆地理编码 -- 解析一条加载一条
function backAddressMsg1(index,addressLngLat,goBackMsg,addressArray,tableID,tdIndex){
  var arrayIndex = index;
  $.ajax(
	{
	    type:"post",
	    url:"/clbs/v/monitoring/getAddress",
	    dataType:"json",
	    async:true,
	    data:{lnglatXYs:addressLngLat[index]},
	    traditional: true,
	    timeout : 30000,
	    success: function(data){
	    	var carAddress = data;
	    	if(carAddress == "AddressNull"){
	            var geocoder = new AMap.Geocoder({
	                radius: 1000,
	                extensions: "base"
	            });
	            geocoder.getAddress(addressLngLat[index]);
	            AMap.event.addListener(geocoder,"complete",function(GeocoderResult){
	              arrayIndex++;
	              var addressValue_index;
	              if(GeocoderResult.info == 'NO_DATA'){
	            	  addressValue_index = '未定位';
	              }else{
	            	  addressValue_index = GeocoderResult.regeocode.formattedAddress;
	            	  var addressParticulars = getaddressParticulars(GeocoderResult,addressLngLat[index][0],addressLngLat[index][1]);
	            	  $.ajax({
	                	type:"POST",
	                    url:"/clbs/v/monitoring/setAddress",
	                    dataType:"json",
	                    async:true,
	                    data:{"addressNew" : addressParticulars},
	                    traditional:false,
	                    timeout : 30000,
	            	  });
	              };
	              $("#" + tableID).children("tbody").children("tr:nth-child(" + arrayIndex + ")").children("td:nth-child("+ tdIndex +")").text(addressValue_index);
	              if(arrayIndex < addressLngLat.length){
	                  backAddressMsg1(arrayIndex,addressLngLat,goBackMsg,addressArray,tableID,tdIndex);
	              }else{
	                return;
	              }
	            });
	        }else{
	          arrayIndex++;
              var addressValue_index = carAddress;
              $("#" + tableID).children("tbody").children("tr:nth-child(" + arrayIndex + ")").children("td:nth-child("+ tdIndex +")").text(addressValue_index);
              if(arrayIndex < addressLngLat.length){
                backAddressMsg1(arrayIndex,addressLngLat,goBackMsg,addressArray,tableID,tdIndex);
              }else{
                return;
              }
	        }
	    },
	});
};
function getaddressParticulars(AddressNew,longitude,latitude){
    var addressParticulars = {
        "longitude" : longitude.substring(0,longitude.lastIndexOf(".")+4),
        "latitude" : latitude.substring(0,latitude.lastIndexOf(".")+4),
        "adcode" : AddressNew.regeocode.addressComponent.adcode,//区域编码
        "building" : AddressNew.regeocode.addressComponent.building,//所在楼/大厦
        "buildingType": AddressNew.regeocode.addressComponent.buildingType,
        "city" : AddressNew.regeocode.addressComponent.city,
        "cityCode" : AddressNew.regeocode.addressComponent.citycode,
        "district" : AddressNew.regeocode.addressComponent.district,//所在区
        "neighborhood" : AddressNew.regeocode.addressComponent.neighborhood,//所在社区
        "neighborhoodType" : AddressNew.regeocode.addressComponent.neighborhoodType,//社区类型
        "province" : AddressNew.regeocode.addressComponent.province,//省
        "street" : AddressNew.regeocode.addressComponent.street,//所在街道
        "streetNumber" : AddressNew.regeocode.addressComponent.streetNumber,//门牌号
        "township" : AddressNew.regeocode.addressComponent.township,//所在乡镇
        "crosses" : "",
        "pois" : "",
        "roads" : AddressNew.regeocode.roads.name,//道路名称
        "formattedAddress" : AddressNew.regeocode.formattedAddress,//格式化地址
    };
    return JSON.stringify(addressParticulars);
};

//跨域请求接口
function getJsonForCross(type,url,data,dataType,async,jsonp,jsonpCallback,callback) {
    $.ajax(
        {
            type: type,
            url: url,
            data: data,
            dataType: dataType,
            async: async,
            jsonp: jsonp,
            jsonpCallback: jsonpCallback,
            timeout : 30000, //超时时间设置，单位毫秒
            beforeSend:beforeSend, //发送请求
            success:callback, //请求成功
            error:error,//请求出错
            complete:complete//请求完成
        })
}

//校验监控对象是否输入正确
function checkBrands(id){
	//标准车牌规则
	var reg = /^[\u4eac\u6d25\u5180\u664b\u8499\u8fbd\u5409\u9ed1\u6caa\u82cf\u6d59\u7696\u95fd\u8d63\u9c81\u8c6b\u9102\u6e58\u7ca4\u6842\u743c\u5ddd\u8d35\u4e91\u6e1d\u85cf\u9655\u7518\u9752\u5b81\u65b0\u6d4b]{1}[A-Z]{1}[A-Z_0-9]{5}$/;
	//香港车牌规则
	var reg1 = /^[A-Z]{2}[0-9]{4}$/;
	var value = $("#" + id).val();
    if(reg.test(value) || reg1.test(value)) {
        return true;
    } else {
        return false;
    }
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


(function($){  

    var csrftoken = getCookie('csrftoken');
    console.log(csrftoken);
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    //备份jquery的ajax方法  
    var _ajax=$.ajax;  
      
    //重写jquery的ajax方法  
    $.ajax=function(opt){  
        //备份opt中error和success方法  
        var fn = {  
          /*  error:function(XMLHttpRequest, textStatus, errorThrown){},  
            success:function(data, textStatus){} ,*/
            complete:function(msg){}
        }  
      /*  if(opt.error){  
            fn.error=opt.error;  
        }  
        if(opt.success){  
            fn.success=opt.success;  
        }  */
        if(opt.complete){
        	fn.complete=opt.complete;
        }

          
        //扩展增强处理  
        var _opt = $.extend(opt,{  
         /*   error:function(XMLHttpRequest, textStatus, errorThrown){  
                //错误方法增强处理  
                  
                fn.error(XMLHttpRequest, textStatus, errorThrown);  
            },  
            success:function(data, textStatus){  
                //成功回调方法增强处理  
                  
                fn.success(data, textStatus);  
            },*/
            complete:function(msg){
            	if (msg.responseText && msg.responseText.indexOf("<form id=\"loginForm") > 0) {
			        window.location.replace("/login?type=expired");
			        return;
				}	
            	fn.complete(msg);
            }
        });  
        return _ajax(_opt);  
    };
    
   $(".fa-chevron-down").on("click",function(){
    	if($(this).next().is(":hidden")){
    	$(this).prev().trigger("focus");
    	$(this).prev().trigger("click");
    	}
    })
    $(".layer-date").unbind("click").on("click",function(){   	
        	$(this).trigger("focus");        	
        })
})(jQuery); 

$(function(){	
		var userGroupId=$("#userGroupId").val();
		var data={"uuid":userGroupId};
		var url="/sysm/personalized/find/";
		// var url="/api/sysm/personalized/find/1/";
     	json_ajax("GET", url, "json", false,data,function(data){
     		if(data.success==true){
     			var list =data.obj.list;
     			var topTitleMsg=list.topTitle;
     			$("#personalizedTitle").html(topTitleMsg);
     			
     			var copyright=list.copyright;
				var websiteName=list.websiteName;
				var recordNumber=list.recordNumber;
				$("#copyRight").html(copyright);
				$("#website").html(websiteName);
				$("#website").attr("href","http://"+websiteName);
				$("#record").html(recordNumber);
     			var homeLogo="/media/resources/img/logo/"+list.homeLogo;
     			$(".brand").attr("style","background:url("+homeLogo+") no-repeat 0px 0px !important;");
     			var webIco=list.webIco;
     			$("#icoLink").attr("href","/media/resources/img/logo/"+webIco+"");
     		}
     	});  
     	$(".panel-heading").bind("click",function(){
             	var id=$(this).context.id;
            	if($("#"+id+"-body").is(":hidden")){
            		$("#"+ id + "-body").slideDown();
             		//$("#"+id+"-body").css("display","block");
             		$("#"+id+"-chevron").removeClass("chevron-up").addClass("chevron-down");
             	}else{
             		$("#"+ id + "-body").slideUp();
               		//$("#"+id+"-body").css("display","none");
               		$("#"+id+"-chevron").removeClass("chevron-down").addClass("chevron-up");
               	}
     	});
});
