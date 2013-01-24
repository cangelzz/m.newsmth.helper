// check if logged in
if ($("form ul li.f").length == 1) {

//add method
$.fn.extend({
	// re-format comment, make text gray and hide overheight comment area
	handle_comment: function() {
		return $(this).find("div.sp").each(function(){
			$(this).html(
				// split by <br>
				$.map($(this).html().split(/<br>/), function(t){
					// match the comment beginning
					if (t.match(/^(:|【)/)){
						return "<span class='comment'>" + t + "</span>"; 
					}
					// remove empty lines
					if (!t) { 
						return null 
					};
					// non comment becomes bodytext
					return "<span class='bodytext'>" + t + "</span>";
				})
				// re-join
				.join("<br>"))
			// wrap the most long comments area to a limited height DIV
			.find("span.comment:first").nextUntil("span.bodytext").wrapAll("<div class='comments'><div>");
		}).end();
	},
	// create page number links for subjects showed in board
	create_pages_for_subjects: function() {
		return $(this).find("ul.list.sec li").find("div:first").each(function(){
			var link = $(this).children("a");
			var base = link.attr("href");
    		var post = $(this).text().match(/\((\d+)\)/);
    		if (post != null) {
    			var total = Math.ceil(post[1] / 10);
    			if (total > 1) {
	    			$(createpages(base, total)).appendTo($(this));
    			}
    		}
		}).end().end();
	},
	// create page number links for posts
	create_pages_for_posts: function() {
		var base = $(this).find(".sec.nav form").attr("action");
		var pageitem = $(this).find(".sec.nav form a.plant").first().text();
		var pages = pageitem.split("/");
		var cur = pages[0];
		var total = pages[1];
		$(createpages_posts(base, cur, total)).appendTo($(this).find(".sec.nav form"));
		return $(this);
	},
	// replace hyperlinks to hash links
	// TODO: rewrite to replace only the post links, not action links
	replace_article_a: function() {
		return $(this).find("a[href^='/article']").each(function(){
			$(this).attr("href", "#" + $(this).attr("href")) 
		}).end();
	},
	// single method for handle posts
	format_posts: function() {
		return $(this).children("div#m_main").handle_comment().create_pages_for_posts().replace_article_a();
	},
	// hide top subjects
	hide_top: function() {
		$(this).find("a.top").parents("li").css("display", "none");
		return $(this);
	},
	// single method for handle subjects
	format_subjects: function() {
		return $(this).update_nav().find("div#m_main").create_pages_for_subjects().replace_article_a().hide_top();
	},
	// update navigation area
	// TODO: add to posts loading, auto update, send desktop notification
	update_nav: function() {
		// check if globalnav is initiated
		var nav = $("#bigpage").children("div.globalnav");
		if (nav.length > 0) {
			nav.empty().append($(this).find("div.menu.nav"));
		}
		else {
			$("#bigpage").prepend("<div class='globalnav'></div>").children(":first").append($(this).find("div.menu.nav"));
		}
		return $(this);
	},
	// init first page of m.newsmth.net
	init_homepage: function(){
		// remove useless nodes
		return $(this).children(":not('#m_main')").remove().end()
			.wrapInner("<div class='contents expanded' style='display:block'></div>")
			.prepend("<div class='header'><a class='close' href='javascript:void(0)'>Close</a><a class='toggle' href='javascript:void(0)'>首页</a></div>")
			.addClass("container");
	},
	// reset max height for container
	reset_maxheight: function(){
		$(this).children("div.contents").css("max-height", $(this).height() - ($(this).children(" div.header").length) * ROW_HEIGHT + "px");
		return $(this);
	},
	// if no content is showing right now, show current loaded content
	check_to_expand: function(){
		if ($(this).siblings(".expanded").length == 0) $(this).slideDown().addClass("expanded");
	}
	
});

var PAGE_MAX = 9999;
var ROW_HEIGHT = 23;
var P_ARTICLE = /#?\/(article|mail|refer)/; // loadable article pattern in wraper2

// start from this, logged in
// create new wraper frame
$("#wraper").wrap("<div id='bigpage'></div>")
	.after("<div id='wraper2' class='container'></div>")
	.update_nav()
	.init_homepage().reset_maxheight()
	// to #bigpage
	.parent()
	.replace_article_a()
	// handle homepage page numbers
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
// TODO: read/save from localStorage
function resize() {
	//$("div#wraper").height($(window).height() - ROW_HEIGHT)
	//$("div#wraper2").height($(window).height() - ROW_HEIGHT);
	$("div#bigpage").height($(window).height());
	$("div.container").height($(window).height() - ROW_HEIGHT).reset_maxheight();
}

var time_update = 0;

function updateLatest() {
	$("a.page_num").each(function(){
		if ($(this).text() == "最新") refreshBoard($(this).parent());
		if ($(this).text() == "尾页") refreshArticle($(this).parent());
	});
}

$("div#bigpage").after("<div id='favor'>Loading ...</div>")
.prepend("<div class='tools'></div>").find("div.tools")
.append("<label>定时更新</label><input id='time_update' type='checkbox' name='time_update' />")
.append("<a class='close_all' href='javascript:void(0)' container='#wraper2'>关闭所有帖子</a><a class='close_all' href='javascript:void(0)' container='#wraper'>关闭所有版面</a>");

$("#time_update").change(function(){
	if (this.checked) {
		time_update = setInterval(updateLatest, 60000);
	}
	else {
		clearInterval(time_update);
	}
});


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
	var link = a.attr("href");
	var board = link.match(/\/board\/(\w+)/)[1];
	var board_text = a.text();
	var page_num = "最新";
	var head = $("<div class='header loading'></div>")
		.attr("board", board)
		.data("link", link)
		.append("<a class='close' href='javascript:void(0)'>Close</a>")
		.append("<a class='toggle' href='javascript:void(0)'>" + board_text + "</a>")
		.append("<span class='tip'> ...</span>")
		.append("<a class='page_num' href='javascript:void(0)'>" + page_num + "</a>")
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
	var link = a.attr("href");
	var board = link.match(/\/board\/(\w+)/)[1];
	var page_num = link.match(/\/board\/\w+\?p=(\d+)/)[1];
	if (page_num == undefined) page_num = "最新";
	var head = a.parents("div.contents").addClass("loading").prev().addClass("loading")
		.data("link", link);
	$.ajax({ url: link, context: head,
		success: function(result){
			head.find("a.page_num").text(page_num);
			$(this).removeClass("loading")
				.next().empty().append($(result).format_subjects()).removeClass("loading").check_to_expand();
		}
	});
}

function refreshBoard(head) {
	head.addClass("loading").next().addClass("loading");
	$.ajax({ url: head.data("link"), context: head,
		success: function(result){
			$(this).removeClass("loading")
				.next().empty().append($(result).format_subjects()).removeClass("loading").check_to_expand();
		}
	});
}

function refreshArticle(head) {
	head.addClass("loading").next().addClass("loading");
	$.ajax({ url: head.data("link"), context: head,
		success: function(result){
			$(this).removeClass("loading")
				.next().empty().append($(result).format_posts()).removeClass("loading").check_to_expand();
		}
	});
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
		.data("link", link)
		.append("<a class='close' href='javascript:void(0)'>Close</a>")
		.append("<a class='page_num' href='javascript:void(0)'>" + page_num + "</a>")
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
	var head = parent.addClass("loading").prev().addClass("loading")
		.data("link", link);
	$.ajax({ url: link, context: head,
		success: function(result){
			head.find("a.page_num").text(page_num);
			$(this).removeClass("loading").next().removeClass("loading").empty().append($(result).format_posts()).scrollTop(0);
		}
	});
}

// reload board
$("#wraper a.page_num").live("click", function(){
	refreshBoard($(this).parent());
});

$("#wraper2 a.page_num").live("click", function(){
	refreshArticle($(this).parent());
});

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
	if (href.match(/\/board/)) {
		$("#favor").hide();
		loadBoard($(this));
	}
});

$("#wraper a").live("click", function(e){
	e.preventDefault();
	var href = $(this).attr("href");
	if (href.match(/\/board/)) {
		return loadBoardInDiv($(this));
	}
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