// check if logged in
if ($("form ul li.f").length == 1) {

//add method
$.fn.extend({
	handle_comment: function() {
		return $(this).find("div.sp").each(function(){
			$(this).html(
				$.map($(this).html().split(/<br>/), function(t){
					if (t.match(/^(:|【)/)){
						return "<span class='comment'>" + t + "</span>"; 
					}
					if (!t) { 
						return null 
					}; 
					return "<span class='bodytext'>" + t + "</span>";
				})
				.join("<br>"))
			.find("span.comment:first").nextUntil("span.bodytext").wrapAll("<div class='comments'><div>");
		}).end();
	},
	
	create_pages_for_subjects: function() {
		return $(this).find("ul.list.sec li").find("div:first").each(function(){
			var link = $(this).children("a");
			var base = link.attr("href");
    		var post = $(this).text().match(/\((\d+)\)/);
    		if (post != null) {
    			var total = Math.ceil(post[1] / 10);
    			if (total > 1) {
    			//console.log("posts: " + post + " pages: " + total);
    			$(createpages(base, total)).appendTo($(this));
    			}
    		}
		}).end().end();
	},

	create_pages_for_posts: function() {
		var base = $(this).find(".sec.nav form").attr("action");
		var pageitem = $(this).find(".sec.nav form a.plant").first().text();
		var pages = pageitem.split("/");
		var cur = pages[0];
		var total = pages[1];
		$(createpages_posts(base, cur, total)).appendTo($(this).find(".sec.nav form"));
		return $(this);
	},
		
	replace_article_a: function() {
		return $(this).find("a[href^='/article']").each(function(){
			$(this).attr("href", "#" + $(this).attr("href")) 
		}).end();
	},
	
	format_posts: function() {
		return $(this).children("div#m_main").handle_comment().create_pages_for_posts().replace_article_a();
	},
		
	hide_top: function() {
		$(this).find("a.top").parents("li").css("display", "none");
		return $(this);
	},
	
	format_subjects: function() {
		return $(this).update_nav().find("div#m_main").create_pages_for_subjects().replace_article_a().hide_top();
	},
		
	update_nav: function() {
		var nav = $("#bigpage").children("div.globalnav");
		if (nav.length > 0) {
			nav.empty().append($(this).find("div.menu.nav"));
		}
		else {
			$("#bigpage").prepend("<div class='globalnav'></div>").children(":first").append($(this).find("div.menu.nav"));
		}
		return $(this);
	},
	
	init_homepage: function(){
		return $(this).children(":not('#m_main')").remove().end().wrapInner("<div class='contents expanded' style='display:block'></div>").prepend("<div class='header'><a class='close' href='javascript:void(0)'>Close</a><a class='toggle' href='javascript:void(0)'>首页</a></div>").addClass("container");
	},
		
	reset_maxheight: function(){
		$(this).children("div.contents").css("max-height", $(this).height() - ($(this).children(" div.header").length) * ROW_HEIGHT + "px");
		return $(this);
	},
		
	check_to_expand: function(){
		if ($(this).siblings(".expanded").length == 0) $(this).prev().trigger("toggle");
	}
	
});

var PAGE_MAX = 9999;
var ROW_HEIGHT = 23;
var P_ARTICLE = /#?\/(article|mail|refer)/;
// logged in
// create new wraper frame
$("#wraper").wrap("<div id='bigpage'></div>").after("<div id='wraper2' class='container'></div>")
	.update_nav()
	.init_homepage().reset_maxheight().parent()
//debugger;
	.replace_article_a()
	.find("a[href^='#/article']").each(function(){ 
		var base = $(this).attr("href");
		var li = $(this).parent();
		var total = Math.ceil($(this).children("span").text() / 10);
		for (var i = 2; i <= total; i++) {
			li.append("<a class='page' href='"+ base + "?p=" + i +"'>"+ i +"</a>");
		}
		li.append("<a class='page page_last' href='"+ base + "?p=" + PAGE_MAX +"'>"+ "尾页" +"</a>");
	});
// add favor frame
function resize() {
	//$("div#wraper").height($(window).height() - ROW_HEIGHT)
	//$("div#wraper2").height($(window).height() - ROW_HEIGHT);
	$("div#bigpage").height($(window).height());
	$("div.container").height($(window).height() - ROW_HEIGHT).reset_maxheight();
}
$("div#bigpage").after("<div id='favor'>Loading ...</div>")
.prepend("<a class='close_all' href='javascript:void(0)' container='#wraper2'>关闭所有帖子</a><a class='close_all' href='javascript:void(0)' container='#wraper'>关闭所有版面</a>");

resize();
// add resize listener
$(window).resize(resize);

//get favor list
$.ajax({url: "/favor", 
success: function(result){ $("#favor").empty(); $(result).find("div#m_main ul").children("li").each(function(){ $(this).html($(this).children()); }).end().removeClass("slist").removeClass("sec")
.appendTo($("#favor")); }
});

function createpages(base, total) {
	var link = "<span class='plant'>|</span>";
	for (var i = 2; i <= total; i++) {
		link = link + "<a class='plant page' href='"+ base + "?p=" + i +"'>"+ i +"</a>";
	}
	link = link + "<a class='page page_last' href='"+ base + "?p=" + PAGE_MAX +"'>"+ "尾页" +"</a>";
	
	return link;
}

function createpages_posts(base, cur, total) {
	var link = "<a class='plant'>|</a>";
	for (var i = 1; i <= total; i++) {
		if (i == cur) {
			link = link + "<span class='cur_page'>" + i + "</span>";
		}
		else {
			link = link + "<a class='page' href='"+ base + "?p=" + i +"'>"+ i +"</a>";
		}
	}
	
	link = link + "<a class='page page_last' href='"+ base + "?p=" + PAGE_MAX +"'>"+ "尾页" +"</a>";
	
	return link;
}

function loadSpecial(a) {
	$("#favor").hide();
	var link = a.attr("href");
	var board = link.match(/\/(\w+)?/)[1];
	if (board == undefined) board = "首页";
	var board_text = a.text();
	var head = $("<div class='header loading'></div>")
		.attr("board", board)
		.append("<a class='close' href='javascript:void(0)'>Close</a>")
		.append("<a class='toggle' href='javascript:void(0)'>" + board_text + "</a>")
		.append("<span class='tip'> ...</span>")
		.appendTo($("#wraper"))
		.after("<div class='contents loading'></div>");
	$("#wraper").reset_maxheight();
	$.ajax({ url: link, context: head,
		success: function(result){
			$(this).removeClass("loading")
				.next().empty().append($(result).format_subjects()).removeClass("loading").check_to_expand();
		}
	});
}

//fill favor layer
function loadBoard(a) {
	$("#favor").hide();
	var link = a.attr("href");
	var board = link.match(/\/board\/(\w+)/)[1];
	var board_text = a.text();
	var page_num = "最新";
	var head = $("<div class='header loading'></div>")
		.attr("board", board)
		.append("<a class='close' href='javascript:void(0)'>Close</a>")
		.append("<a class='toggle' href='javascript:void(0)'>" + board_text + "</a>")
		.append("<span class='tip'> ...</span>")
		.append("<span class='page_num'>" + page_num + "</span>")
		.appendTo($("#wraper"))
		.after("<div class='contents loading'></div>");
	$("#wraper").reset_maxheight();
	$.ajax({ url: link, context: head,
		success: function(result){
			$(this).removeClass("loading")
				.next().empty().append($(result).format_subjects()).removeClass("loading").check_to_expand();
		}
	});
}

function loadBoardInDiv(a) {
	
}

function loadArticle(a) {
	var link = a.attr("href").substr(1);
	document.location.hash = link;
	// check if it is a page link
	var subject = a.text();
	var page_num = 1;
	if (link.match(/\?p=\d+/)) { 
		page_num = subject;
		subject = a.prevAll(":last").text();
	}
	
	//document.location.hash = link;
	var head = $("#wraper2").append("<div class='header loading'><a class='toggle' href='javascript:void(0)'>" + subject + "</a><span class='tip'> ...</span></div>")
		//div header
		.children(":last")
		.append("<a class='close' href='javascript:void(0)'>Close</a>")
		.append("<span class='page_num'>" + page_num + "</span>")
		.after("<div class='contents'></div>");
	$("#wraper2").reset_maxheight();
//	debugger;
	$.ajax({ url: link, context: head, 
		success: function(result){
			$(this).removeClass("loading").next().append($(result).format_posts()).check_to_expand();
		}
	});
}

function loadArticleInDiv(a) {
	var link = a.attr("href").substr(1);
	document.location.hash = link;
	var page_num = 1;
	var m = link.match(/\?p=(\d+)/)
	if (m) {
		if (m[1] == PAGE_MAX) page_num = "尾页";
		else page_num = m[1];
	}
	
	var parent = a.parents("div.contents");
	var head = parent.addClass("loading").prev().addClass("loading");
	$.ajax({ url: link, context: head,
		success: function(result){
			head.find("span.page_num").text(page_num);
			$(this).removeClass("loading").next().removeClass("loading").empty().append($(result).format_posts()).scrollTop(0);
		}
	});
}

$("div.header").live("toggle", function(){
	var content = $(this).next();
	if (content.hasClass("expanded")) {
		content.removeClass("expanded").slideUp();
	}
	else {
		content.siblings(".contents.expanded").removeClass("expanded").slideUp();
		content.slideDown().addClass("expanded");
	}
});

$("div.header > a.close").live("click", function(){
	var parent = $(this).parent();
	var container = $(this).parents(".container");
	var next = parent.next().next();
	if (next.length == 0) next = parent.prev().prev();
	
	parent.next().remove().end().remove();
	container.reset_maxheight();
	
	if (next.length > 0 && container.children("div.expanded").length == 0) next.trigger("toggle");
});

$("a.close_all").live("click", function(){
	$($(this).attr("container")).empty();
});

$("div.header > a.toggle").live("click", function(){
	$(this).parent().trigger("toggle");
});

$(".globalnav a").live("click", function(e){
	e.preventDefault();
	var href = $(this).attr("href");
	if (href.match(/\/favor/)) return $("#favor").toggle();
	if (href.match(/\/(\w+)?/)) loadSpecial($(this));
});


$("#favor a").live("click", function(e){
	e.preventDefault();
	var href = $(this).attr("href");
	if (href.match(/\/board/)) loadBoard($(this));
});

$("#wraper a").live("click", function(e){
	e.preventDefault();
	var href = $(this).attr("href");
	if (href.match(/\/board/)) return loadBoard($(this));
	if (href.match(/#\/article/)) return loadArticle($(this));
	if (href.match(P_ARTICLE)) return loadArticle($(this));
});

$("#wraper2 a").live("click", function(e){
	e.preventDefault();
	var href = $(this).attr("href");
	if (href.match(/\/board/)) loadBoard($(this));
	if (href.match(/#\/article/)) loadArticleInDiv($(this));
});

} // big function end