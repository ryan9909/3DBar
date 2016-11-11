
// JavaScript Document
function LineMap(obj,data,params)
{	
	this.Option = {
		/* Parameters of title */
		titleOption : {
			height : 20,
			show : true,
			text : "Three-dimensional histogram",
			style :{
				"font-size" : "20px",
				"font-family" : "Arial",			
				"font-weight" : "bold",
				"left" : "40px",
				"text-align" : "center"				
			}
		},
		/* X-axis font parameters */
		XOption : {
			show : true,
			style : {
				"font-size" : "12px",
				"font-family" : "Arial",
				"text-align" : "center"
			},
			unitShow : false,
			unitText : null
		},
		/* The parameters of the histogram hint */
		Cue : {
			show : true,
			style : {
				"font-size" : "12px",
				"font-family" : "Arial",
				"text-align" : "center"					
			}
		},
		/* Parameters of Y-axis tick line */
		YOption : {
			show : true,
			style : {
				"font-size" : "12px",
				"font-family" : "Arial",
				"text-align" : "right",
				"width" : 35	
			},
			unitShow : false,
			unitText : null
		},
		/* The parameters of the entire layer Line for the tick marks, XGrap for the X axis, YGrap for the Y axis, BackGrap for the background */
		GraphOption : {	
			Line : {
				show : true,
				color : "red"
			},
			XGrap : {
				"StartOrBackColor" : "gray",
				"Gradient" : false,
				"EndColor" : "red"
			},
			YGrap : {
				"StartOrBackColor" : "gray",
				"Gradient" : false,
				"EndColor" : "red"
			},
			BackGrap : {
				"StartOrBackColor" : "yellow",
				"Gradient" : false,
				"EndColor" : "black"
			},	
			BackGroud : {
				show : true,
				"backGroundColor" : "gray",
				"backImgPath" : null
			}
		},
		/* Parameters for a single histogram */
		PillarParams : {			
			YGradient : 10 ,
			FacadeStyle :{ 
				"StartColor" : "#a9b961",
				"Gradient" : true,
				"EndColor" : "#98ad52"
			},
			TopStyle : { 
				"StartColor" : "#aabe45",
				"Gradient" : false,
				"EndColor" : "red"
			},
			ProfileStyle : { 
				"StartColor" : "#a9b961",
				"Gradient" : true,
				"EndColor" : "#98ad52"
			}
		}	
	}
	/* Initialization parameters */
	this.OtherOption = params == null ? {} : params;
	/* Get the impression data */
	this.data = data;
	/* Defines the width of the histogram */
	this.PillarWidth = null;
	/* Defines the interval between histograms */
	this.PillarSpace = null;
	/* Defines the interval between the y-axis tick marks */
	this.XSpace = null;
	/* Defines canvas */
	this.obj = obj;
	/* Defines a DIV outside the canvas */
	this.parent_obj = $(obj).parent("div");
	/* Gets the width of the canvas */
	this.width = obj.width;
	/* Gets the height of the canvas */
	this.height = obj.height;
	/* Define a drawing tool */
	this.ctx = obj == null ? null : obj.getContext("2d");	
	/* Defines the scale value for the tick marks */
	this.XItem = [];
	/* Define the histogram data */
	this.PillarData = [];	
}
/* Layer initialization */
LineMap.prototype.init = function()
{		
	var soursedata = this.OtherOption;
	parseJson(soursedata,this.Option);
	this.Option = soursedata;
	this.Option.titleOption.style.width = this.width -60;
	/* Get the maximum data */
	var MaxData = this.GetMaxData(this.data);
	/* Gets the data for each scale */
	var DataSpace = parseInt(MaxData / 8);
	/* Initializes the gap between the Y axis axes */
	this.XSpace = parseInt((this.height -50)/9);
	for(var i =0 ; i<10;i++)
	{
		this.XItem.push([i*DataSpace]);			
	}	
	var Gap =  1/this.data.length * 100;
	var X_Position = parseInt(this.width / this.data.length) - Gap;
	this.PillarWidth = parseInt(this.width / this.data.length) * 0.5;
	for(var i =0;i<this.data.length;i++)
	{
		var x = X_Position * i + 65;			
		var count = this.data[i][1];
		var y = count / DataSpace * this.XSpace;
		this.PillarData.push([y,this.data[i][0],this.data[i][1],x]);	
	}
	
	this.Option.XOption.style.width = this.PillarWidth + this.Option.PillarParams.YGradient ;
	this.Option.Cue.style.width = this.PillarWidth + this.Option.PillarParams.YGradient+20;
	
	$(this.obj).css("margin-top",this.Option.titleOption.height);
	this.parent_obj.css({"position":"relative","clear":"both"});	
	this.DrawGraph();
	this.DrawAllData();		
	if(this.Option.GraphOption.BackGroud.show)
	{
		if(this.Option.GraphOption.BackGroud.backImgPath)
		{
			$(this.parent_obj).css("background","url("+ this.Option.GraphOption.BackGroud.backImgPath +")");
		}
		else
		{
			$(this.parent_obj).css("background",this.Option.GraphOption.BackGroud.backGroundColor);	
		}
	}
}
/* The maximum data is obtained */
LineMap.prototype.GetMaxData = function(data)
{
	var Max_data = 0;
	for(var i = 0;i<data.length;i++)
	{
		if(data[i][1] > Max_data)
		{
			Max_data = data[i][1];	
		}
	}
	return Max_data + 7;
}

/* Histogram */
LineMap.prototype.DrawAllData = function()
{
	var x = this.width - 20;
	var y = this.height - 20;		
	for(var i = 0; i<this.PillarData.length; i++)
	{
		var data = this.PillarData[i];
		this.DrawPillar(data[3],y,data[3],y-data[0],data[1],data[2]);
	}
	if(this.Option.XOption.unitShow)
	{
		var style = this.Option.XOption.style;
		style.width = 70;
		style["text-align"] = "left";
		this.DrawCue(this.Option.XOption.unitText,x-20,y+this.Option.PillarParams.YGradient+50,style);
	}
}

/* Draw the X-axis, Y-axis, and background */
LineMap.prototype.DrawGraph = function()
{
	this.DrawY(); 
	this.DrawTitle(this.Option.titleOption.text);
	this.DrawX(); 
	this.DrawBack();
	if(this.Option.GraphOption.Line.show)
	{
		for(var i =0; i<this.XItem.length;i++)
		{
			if(i==0)
			{
				this.LineX(40,this.height - 20,this.XItem[i]);
			}
			else
			{
				this.LineX(40,this.height - (20+i*this.XSpace),this.XItem[i]);	
			}
		}
	}
	if(this.Option.YOption.unitShow)
	{
		var style = this.Option.YOption.style;
		style.width = 70;
		style["text-align"] = "left";
		this.DrawCue(this.Option.YOption.unitText,0,40,style);
	}
}
/* Draw the title */
LineMap.prototype.DrawTitle = function(title)
{
	if(this.Option.titleOption.show)
	{
		var position_x = parseInt(this.width / 2);
		this.DrawCue(title,position_x,10,this.Option.titleOption.style);
	}
}

/* Draw the Y axis */
LineMap.prototype.DrawY = function()
{
	var y = this.height - 20;
	var ctx = this.ctx;
	
	var grd=ctx.createLinearGradient(40,y,40,30);
	grd.addColorStop(0,this.Option.GraphOption.XGrap.StartOrBackColor);
	if(this.Option.GraphOption.XGrap.Gradient)
	{
		grd.addColorStop(1,this.Option.GraphOption.XGrap.EndColor);
	}
	ctx.fillStyle=grd;
	ctx.beginPath();
    ctx.moveTo(40, y);
	ctx.lineTo(60 ,y-this.Option.PillarParams.YGradient-10);
	ctx.lineTo(60 , 20 - this.Option.PillarParams.YGradient);
    ctx.lineTo(40, 30);	
	ctx.fill();  	
	ctx.closePath();
}
/* Draw the Y-axis scale */
LineMap.prototype.LineX = function(x,y,data)
{
	var height = this.Option.titleOption.height;
	var ctx = this.ctx;
	var l_y = this.height - 20;
	var l_x = this.width - 20;
	ctx.strokeStyle = this.Option.GraphOption.Line.color;
  	ctx.lineWidth = 0.8;
	ctx.beginPath();
    ctx.moveTo(x, y);
	ctx.lineTo(x+20 ,y-this.Option.PillarParams.YGradient-10);
	ctx.lineTo(x+l_x-40,y-this.Option.PillarParams.YGradient-10);
	ctx.stroke(); 	
	ctx.closePath();	
	if(this.Option.YOption.show)
	{
		this.DrawCue(data,0,y+height+this.Option.PillarParams.YGradient,this.Option.YOption.style);
	}
}
/* Draw the X axis */
LineMap.prototype.DrawX = function()
{
	var ctx = this.ctx;
	var y = this.height - 20;
	var x = this.width - 20;
	
	var grd=ctx.createLinearGradient(40,y,x,y-this.Option.PillarParams.YGradient-10);
	grd.addColorStop(0,this.Option.GraphOption.YGrap.StartOrBackColor);
	if(this.Option.GraphOption.YGrap.Gradient)
	{
		grd.addColorStop(1,this.Option.GraphOption.YGrap.EndColor);
	}
	ctx.fillStyle=grd;
	
	//ctx.fillStyle   = this.Option.GraphOption.YGrap.StartOrBackColor;	
	ctx.beginPath();
    ctx.moveTo(40, y);
	ctx.lineTo(x -20 ,y);
	ctx.lineTo(x ,y-this.Option.PillarParams.YGradient-10);
	//var l_X = 
    ctx.lineTo(60, y-this.Option.PillarParams.YGradient-10);	
	ctx.fill();  	
	ctx.closePath();		
}
/* Draw the background */
LineMap.prototype.DrawBack = function()
{
	var context = this.ctx;
	var y = this.height - 20;
	var x = this.width - 20;	
	var grd=context.createLinearGradient(40,y,40,30);
	grd.addColorStop(0,this.Option.GraphOption.BackGrap.StartOrBackColor);
	if(this.Option.GraphOption.BackGrap.Gradient)
	{
		grd.addColorStop(1,this.Option.GraphOption.BackGrap.EndColor);
	}
	context.fillStyle=grd;
	//context.fillStyle   = this.Option.GraphOption.BackGrap.StartOrBackColor; // blue	
	context.fillRect(60,20 -this.Option.PillarParams.YGradient, x-60, y-30);		
}
/* Draw individual histograms */
LineMap.prototype.DrawPillar = function(begin_x,begin_y,end_x,end_y,cue,data)
{
	var height = this.Option.titleOption.height;
	this.DrawFacade(begin_x,begin_y,end_x,end_y);
	this.DrawTop(end_x,end_y,end_x+20,end_y-this.Option.PillarParams.YGradient-10);
	this.DrawProfile(begin_x+this.PillarWidth,begin_y,end_x+this.PillarWidth,end_y);	
	if(this.Option.Cue.show)
	{
		this.DrawCue(data,end_x,end_y-20+height,this.Option.Cue.style);
	}
	if(this.Option.XOption.show)
	{	    
		this.DrawCue(cue,begin_x-5,begin_y+13+height+this.Option.PillarParams.YGradient,this.Option.XOption.style);
	}
}
/* Histogram Front */
LineMap.prototype.DrawFacade = function(begin_x,begin_y,end_x,end_y)
{
	var ctx = this.ctx;	
	
	var grd=ctx.createLinearGradient(begin_x,begin_y,end_x,end_y);
	grd.addColorStop(0,this.Option.PillarParams.FacadeStyle.StartColor);
	if(this.Option.PillarParams.FacadeStyle.Gradient)
	{
		grd.addColorStop(1,this.Option.PillarParams.FacadeStyle.EndColor);
	}
	ctx.fillStyle = grd;
	ctx.beginPath();
    ctx.moveTo(begin_x, begin_y);
	ctx.lineTo(begin_x+this.PillarWidth ,begin_y);
	ctx.lineTo(end_x+this.PillarWidth ,end_y);
    ctx.lineTo(end_x, end_y);	
	ctx.fill();  	
	ctx.closePath();
}

/* The top of the histogram */
LineMap.prototype.DrawTop = function(begin_x,begin_y,end_x,end_y)
{
	var ctx = this.ctx;	
	var grd=ctx.createLinearGradient(begin_x,begin_y,end_x,end_y);
	grd.addColorStop(0,this.Option.PillarParams.TopStyle.StartColor);
	if(this.Option.PillarParams.TopStyle.Gradient)
	{
		grd.addColorStop(1,this.Option.PillarParams.TopStyle.EndColor);
	}	
	ctx.fillStyle = grd;
	ctx.beginPath();
    ctx.moveTo(begin_x, begin_y);
	ctx.lineTo(begin_x+this.PillarWidth ,begin_y);
	ctx.lineTo(end_x+this.PillarWidth ,end_y);
    ctx.lineTo(end_x, end_y);	
	ctx.fill();  	
	ctx.closePath();
}

/* The side of the histogram */
LineMap.prototype.DrawProfile = function(begin_x,begin_y,end_x,end_y)
{
	var ctx = this.ctx;
	var grd=ctx.createLinearGradient(begin_x,begin_y,end_x,end_y);
	grd.addColorStop(0,this.Option.PillarParams.ProfileStyle.StartColor);
	if(this.Option.PillarParams.ProfileStyle.Gradient)
	{
		grd.addColorStop(1,this.Option.PillarParams.ProfileStyle.EndColor);
	}
	ctx.fillStyle = grd;
	ctx.beginPath();
    ctx.moveTo(begin_x, begin_y);
	ctx.lineTo(begin_x+20 ,begin_y-this.Option.PillarParams.YGradient -10);
	ctx.lineTo(end_x+20,end_y-this.Option.PillarParams.YGradient - 10);
    ctx.lineTo(end_x, end_y);	
	ctx.fill();    
	ctx.closePath();
}
/* Layer hints */
LineMap.prototype.DrawCue = function(l_data,x,y,style)
{
	var div = document.createElement("DIV");
	$(div).css({"position" : "absolute","margin" : "0px" ,"padding" :"0px"});
	for(var item in style)
	{
		$(div).css(item,style[item]);			
	}
	if(!style.left)
	{	
		$(div).css("left",x);
	}	
	$(div).css("top",y -this.Option.PillarParams.YGradient-6);
	//div.style.top = ;	
	div.innerHTML = l_data;
	this.parent_obj.append($(div));
}


/* Merge two Json objects */
function parseJson(o,a_data)
{		
	for(var item in a_data)
	{			
		if(o[item] ==null)
		{	
			o[item] = a_data[item];	
		}				
		else
		{				
			parseChildJson(o,a_data[item],item,o);
		}
	}	
}

function parseChildJson(o,a_data,index,l_data)
{
	
	for(var item in a_data)
	{			
		if(l_data[index][item] ==null)
		{						
			l_data[index][item] = a_data[item];	
		}
		else 
		{				
			
			if(typeof(a_data[item]) == "object" )
			{						
				parseChildJson(o,a_data[item],item,o[index]);
			}				
		}
	}
}

