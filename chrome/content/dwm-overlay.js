/******************************************************************************
Copyright 2008 Matthew Holder. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.
   2. Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*********************************************************************************/
var glassTo = null;
var inFullscreen = false;
var dwm = Components.classes["@sixxgate.com/DwmCalls/CDwmCalls;1"].createInstance();
dwm = dwm.QueryInterface(Components.interfaces.IDwmCalls);

function DWM_Glasser_OnFullscreen()
{
	this.handleEvent = function(e)
	{
		if (!dwm.GlassEnabled || glassTo == null)
			// If no glass, we have nothing to do
			return;

		if (e.attrName == "inFullscreen" && e.newValue == "true")
		{
			try
			{
				dwm.ExtendFrameIntoWindow(0, 0, 0, 0);
			}
			catch (err)
			{	// Something failed
				window.alert(err);
			}
			inFullscreen = true;
		}
		else if (e.attrName == "inFullscreen")
		{
			try
			{
				var height = glassTo.boxObject.y + glassTo.boxObject.height;
				dwm.ExtendFrameIntoWindow(height, 0, 0, 0);
			}
			catch (err)
			{	// Something failed
				window.alert(err);
			}
			inFullscreen = false;
		}
	}
};
var Glasser_OnFullscreen = new DWM_Glasser_OnFullscreen();

function DWM_Glasser_Delayed_OnAttrChange()
{
	this.handleEvent = function(e)
	{
		if (!dwm.GlassEnabled || glassTo == null || inFullscreen == true)
			// If no glass, we have nothing to do
			return;

		var height = glassTo.boxObject.y + glassTo.boxObject.height;

		try
		{
			dwm.ExtendFrameIntoWindow(height, 0, 0, 0);
		}
		catch (err)
		{	// Something failed
			window.alert(err);
		}

		e.currentTarget.removeEventListener("DOMAttrModified", this, false);
	};
};
var Glasser_Delayed_OnAttrChange = new DWM_Glasser_Delayed_OnAttrChange();

function ChangeGlasserTheme()
{
	if (dwm.GlassEnabled)
	{
		for (var i = 0; i != window.document.styleSheets.length; ++i)
		{
			if (window.document.styleSheets[i].href == "chrome://glasser/skin/overlay.css")
			{
				window.document.styleSheets[i].disabled = false;
				break;
			}
		}
		Glasser_Delayed_OnAttrChange.handleEvent(e);
	}
	else
	{
		for (var i = 0; i != window.document.styleSheets.length; ++i)
		{
			if (window.document.styleSheets[i].href == "chrome://glasser/skin/overlay.css")
			{
				window.document.styleSheets[i].disabled = true;
				break;
			}
		}
	}
};

function DWM_Glasser_OnAttrChange()
{
	this.handleEvent = function(e)
	{
		e.currentTarget.addEventListener("DOMAttrModified", Glasser_Delayed_OnAttrChange, false);
	};
};
var Glasser_OnAttrChange = new DWM_Glasser_OnAttrChange();

function DWM_Glasser_OnLoad()
{
	this.handleEvent = function(e)
	{
		// Find the toolbar marked as glassToMe
		var toolbox = window.document.getElementById("navigator-toolbox")
		if (toolbox == null)
			return;
			
		toolbox.addEventListener("DOMAttrModified", Glasser_OnFullscreen, false);

		var ct = toolbox.firstChild;
		var breakNow = false;
		for (; ct != null; ct = ct.nextSibling)
		{
			if (ct.tagName != "toolbar")
				// Only toolbar are of any concern
				continue;

			ct.addEventListener("DOMAttrModified", Glasser_OnAttrChange, false);

			if (breakNow)
				// We have attatched to the last toolbar, we are done
				break;

			if (ct.getAttribute("glassToMe") != null && ct.getAttribute("glassToMe") == "true")
			{	// We have found the end of the glass, break on the next toolbar
				glassTo = ct;
				breakNow = true;
			}
		}
		
		ChangeGlasserTheme();
	};
};
var Glasser_OnLoad = new DWM_Glasser_OnLoad();

function DWM_Glasser_OnGlassChange()
{
	this.handleEvent = function(e)
	{
		ChangeGlasserTheme();
	};
};
var Glasser_OnGlassChange = new DWM_Glasser_OnGlassChange();

window.addEventListener("load", Glasser_OnLoad, false);

dwm.AttachToWindow(window);
dwm.OnGlassChange = Glasser_OnGlassChange;