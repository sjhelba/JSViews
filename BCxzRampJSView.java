package com.tekworx.cx.web;

import javax.baja.naming.BOrd;
import javax.baja.sys.BSingleton;
import javax.baja.sys.Context;
import javax.baja.sys.Sys;
import javax.baja.sys.Type;
import javax.baja.web.BIFormFactorMax;
import javax.baja.web.js.BIJavaScript;
import javax.baja.web.js.JsInfo;


public class BCxRampJSView extends BSingleton
	implements BIJavaScript, BIFormFactorMax {

	  private BCxRampJSView() {}
	  public static final BCxRampJSView INSTANCE = new BCxRampJSView();

	  @Override
	  public Type getType() { return TYPE; }
	  public static final Type TYPE = Sys.loadType(BCxRampJSView.class);

	  public JsInfo getJsInfo(Context cx) { return jsInfo; }

	  private static final JsInfo jsInfo =
	      JsInfo.make(BOrd.make("module://COREx/rc/web/CxRampJSView/javascript.js"));
	  

}
