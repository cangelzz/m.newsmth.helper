var installed = false;
//$("body").append("<div style='width: 100%;height:100%;background-color: #58676D;position:absolute;top:0;opacity:.8'>loading</div>");
// check if logged in
if ($("form ul li.f").length == 1 && !installed) {

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
            return null;
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
        var post = $(this).text().match(/\((\d+)\)$/);
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
    var form = $(this).find(".sec.nav form");
    var base = form.attr("action");
    var a = form.children("a:first");
    var extra = "";
    if (a.attr("href") != undefined) {
      var m = a.attr("href").match(/au=\w+/);
      if (m != null) extra = m[0];
    }
    //debugger;
    
    var pageitem = $(this).find(".sec.nav form a.plant").first().text();
    var pages = pageitem.split("/");
    var cur = pages[0];
    var total = pages[1];
    $(createpages_posts(base, cur, total, extra)).appendTo($(this).find(".sec.nav form"));
    return $(this);
  },
  // replace hyperlinks to hash links
  // TODO: rewrite to replace only the post links, not action links
  replace_article_a: function() {
    return $(this).find("a[href^='/article']").each(function(){
      var href = $(this).attr("href");
      if (href.match(P_ARTICLE))
        $(this).attr("href", "#" + $(this).attr("href"));
    }).end();
  },
  // remove just to section div
  remove_jump_section: function() {
    return $(this).find("div.sec.sp").remove().end();
  },
  // single method for handle posts
  format_posts: function() {
    return $(this).children("div#m_main").remove_jump_section().handle_comment().create_pages_for_posts().replace_article_a();
  },
  // hide top subjects
  hide_top: function() {
    $(this).find("a.top").parents("li").css("display", "none");
    return $(this);
  },
  // single method for handle subjects
  format_subjects: function() {
    return $(this).update_nav().find("div#m_main").remove_jump_section().create_pages_for_subjects().replace_article_a().hide_top();
  },
  format_specials: function() {
    return $(this).update_nav().find("div#m_main").remove_jump_section().create_pages_for_subjects().replace_article_a();
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
      .prepend("<div class='header'><a class='close' href='javascript:void(0)'>关闭</a><a class='toggle' href='javascript:void(0)'>首页</a></div>")
      .addClass("container");
  },
  // reset max height for container
  reset_maxheight: function(){
    $(this).children("div.contents").css("max-height", $(this).height() - ($(this).children("div.header").length) * ROW_HEIGHT - 1 + "px");
    return $(this);
  },
  // if no content is showing right now, show current loaded content
  check_to_expand: function(){
    if ($(this).siblings(".expanded").length == 0) $(this).slideDown().addClass("expanded");
  }
  
});

var PAGE_MAX = 9999;
var ROW_HEIGHT = 21;
var MENU_HEIGHT = 22;
var P_LOAD_ARTICLE = /#?\/(article|mail|refer)/;
var P_ARTICLE = /\/article\/\w+\/\d+/; // loadable article pattern in wraper2
var P_ARTICLE_ACTION = /\/(article|mail)\/\w+\/(post|send|forward)/;
var P_LOAD_BOARD_IN_DIV = /\/board/;
var P_LOAD_SPEC_IN_DIV = /\/(refer\/at|refer\/reply\/|refre\/reply\?|mail\/inbox\/|mail\/outbox\/|mail\/deleted\/|hot\/|hot\/\w+)$/;
//var P_LOAD_SPEC = //;
var recent_closed = [];

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
  $("div#bigpage").height($(window).height() - 10);
  $("div.container").height($("div#bigpage").height() - MENU_HEIGHT).reset_maxheight();
  $("#favor").offset({left: $("a[href*=favor]").offset().left });
}

var time_update = 0;

function updateLatest() {
  //$("a.page_num").each(function(){
//    if ($(this).text() == "最新") refresh_board($(this).parent());
    //if ($(this).text() == "尾页") refres_article($(this).parent());
  //});
  $("#wraper a.page_num").each(function(i, v){
    var head = $(this).parent();
    setTimeout(function(){ refresh_board(head); }, 3000 + 3000 * i);
  });
  
}

$("div#bigpage").after("<div id='favor'>Loading ...</div>")
.prepend("<div class='tools'></div>").find("div.tools")
.append("<div class='recent_div tool'><a href='javascript:void(0)' id='recent'>最近关闭</a><ul></ul></div> ")
.append("<div class='tool'><label>打开版面</label><input type='text' id='jumpboard' /></div>")
.append("<div class='tool'><label>定时更新</label><input id='time_update' type='checkbox' name='time_update' /></div>")
.append("<div class='tool'><a class='close_all' href='javascript:void(0)' container='#wraper2'>关闭所有帖子</a><a class='close_all' href='javascript:void(0)' container='#wraper'>关闭所有版面</a></div>");

$("#time_update").change(function(){
  if (this.checked) {
    time_update = setInterval(updateLatest, 60000);
  }
  else {
    clearInterval(time_update);
  }
});

$("#jumpboard").keypress(function(event){
  if (event.keyCode == '13') {
    load_board($("<a href='http://m.newsmth.net/board/"+ $(this).val() +"'>"+ $(this).val() +"</a>"));
  }
});

// add resize listener
$(window).resize(resize);

//get favor list
$.ajax({url: "/favor", 
  success: function(result){
    var $this = $("#favor");
    $this.empty(); 
    $(result).find("div#m_main ul").children("li").each(function(){ 
      $(this).html($(this).children());
    }).end().removeClass("slist").removeClass("sec")
    .appendTo($this);
    $this.append("<label>multi-selection</label><input type='checkbox' checked='false'/>");
    //$a = $(".menu a[href*=favor]");
    //$this.offset({top:$a.offset().top + 22 , left: $a.offset().left });
  }
});

function createpages(base, total) {
  var link = "<span class='plant'>|</span>";
  for (var i = 2; i <= total; i++) {
    link = link + "<a class='plant page' href='"+ base + "?p=" + i +"'>"+ i +"</a>";
  }
  link = link + "<a class='page page_last' href='"+ base + "?p=" + PAGE_MAX +"'>"+ "尾页" +"</a>";
  
  return link;
}

function createpages_posts(base, cur, total, extra) {
  if (extra == undefined) extra = "";
  var link = "<span class='plant'>|</span>";
  for (var i = 1; i <= total; i++) {
    if (i == cur) {
      link = link + "<span class='cur_page'>" + i + "</span>";
    }
    else {
      link = link + "<a class='page' href='" + base + "?p=" + i + "&" + extra + "'>" + i +"</a>";
    }
  }
  
  link = link + "<a class='page page_last' href='" + base + "?p=" + PAGE_MAX + "&" + extra + "'>" + "尾页" +"</a>";
  
  return link;
}

function load_special(a) {
  $("#favor").slideUp();
  var link = a.attr("href");
  var board = link.match(/\/(\w+)?/)[1];
  if (board == undefined) board = "首页";
  var board_text = a.text();
  var page_num = "最新";
  var head = $("<div class='header loading'></div>")
    .attr("board", board)
    .data("link", link)
    .addClass("special")
    .append("<a class='close' href='javascript:void(0)'>关闭</a>")
    .append("<a class='toggle' href='javascript:void(0)'>" + board_text + "</a>")
    .append("<span class='tip'> ...</span>")
    .append("<a class='page_num' href='javascript:void(0)'>" + page_num + "</a>")
    .appendTo($("#wraper"))
    .after("<div class='contents loading'></div>");
  $("#wraper").reset_maxheight();
  $.ajax({ url: link, context: head,
    success: function(result){
      $(this).removeClass("loading")
        .next().empty().append($(result).format_specials()).removeClass("loading").check_to_expand();
    }
  });
}

function load_special_in_div(a) {
  //debugger;
  var link = a.attr("href");
  var board = link.match(/\/(\w+)?/)[1];
  if (board == undefined) board = "首页";
  var board_text = a.text();
  var result = link.match(/\?p=(\d+)/);
  var page_num;
  if (result) page_num = result[1]; else page_num = undefined;
  if (page_num == undefined || page_num == "1") page_num = "最新";
  var head = $(a).parents("div.contents").addClass("loading").prev().addClass("loading").data("link", link);
  $.ajax({ url: link, context: head,
    success: function(result){
      head.children("a.toggle").text(board_text);
      $(this).removeClass("loading")
        .next().empty().append($(result).format_specials()).removeClass("loading").check_to_expand();
    }
  });
}

function add_record(b){
  var key = b;
  var cnt = localStorage.getItem(key);
  //console.log("-- " + cnt);
  if (cnt == undefined) cnt = 0;
  cnt++;
  localStorage.setItem(key, cnt);
}

//fill favor layer
function load_board(a) {
  add_record(a.text().match(/\((\w+)\)/)[1]);
  var link = a.attr("href");
  var board = link.match(/\/board\/(\w+)/)[1];
  var board_text = a.text();
  var page_num = "最新";
  var head = $("<div class='header loading'></div>")
    .attr("board", board)
    .data("link", link)
    .append("<a class='close' href='javascript:void(0)'>关闭</a>")
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

function load_board_in_div(a) {
  var link = a.attr("href");
  var board = link.match(/\/board\/(\w+)/)[1];
  var page_num = link.match(/\/board\/\w+\?p=(\d+)/)[1];
  if (page_num == undefined || page_num == "1") page_num = "最新";
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

function refresh_special(head) {
  head.addClass("loading").next().addClass("loading");
  $.ajax({ url: head.data("link"), context: head,
    success: function(result){
      $(this).removeClass("loading")
        .next().empty().append($(result).format_subjects()).removeClass("loading").check_to_expand();
    }
  });
}

function refresh_board(head) {
  add_record(head.attr("board"));
  head.addClass("loading").next().addClass("loading");
  $.ajax({ url: head.data("link"), context: head,
    success: function(result){
      $(this).removeClass("loading")
        .next().empty().append($(result).format_subjects()).removeClass("loading").check_to_expand();
    }
  });
}

function refres_article(head) {
  head.addClass("loading").next().addClass("loading");
  $.ajax({ url: head.data("link"), context: head,
    success: function(result){
      $(this).removeClass("loading")
        .next().empty().append($(result).format_posts()).removeClass("loading").check_to_expand();
    }
  });
}

function load_article(a) {
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
    .data("a", a.clone())
    .append("<a class='close' href='javascript:void(0)'>关闭</a>")
    .append("<a class='page_num' href='javascript:void(0)'>" + page_num + "</a>")
    .after("<div class='contents'></div>");
  $("#wraper2").reset_maxheight();
//  debugger;
  $.ajax({ url: link, context: head, 
    success: function(result){
      $(this).removeClass("loading").next().append($(result).format_posts()).check_to_expand();
    }
  });
}

function load_article_in_div(a) {
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
$("#wraper").on("click", "a.page_num", function(){
  var header = $(this).parent();
  if (header.hasClass("special")){
    refresh_special(header);
  }
  else {
    refresh_board($(this).parent());
  }
});

$("#wraper2").on("click", "a.page_num", function(){
  refres_article($(this).parent());
});

$(document).on("toggle", "div.header", function(){
  var content = $(this).next();
  if (content.hasClass("expanded")) {
    content.removeClass("expanded").slideUp();
  }
  else {
    content.siblings(".contents.expanded").removeClass("expanded").slideUp();
    content.slideDown().addClass("expanded");
  }
});

$("a#recent").click(function(){ $("div.recent_div ul").fadeToggle(); });
$("a#recent").hover(function(){
  if ($("div.recent_div ul li").length > 0) {
    $("div.recent_div ul").fadeIn();
  }
}, function(){});
$(document).on("click", "div.recent_div ul li a", function(){
  load_article($(this));
  $(this).parent().remove();
  $("div.recent_div ul").fadeOut();
});

$("#wraper2").on("click", "div.header > a.close", function(){
  var parent = $(this).parent();
  $("div.recent_div ul").prepend($("<li></li>").append(parent.data("a")));
  if ($("div.recent_div ul").children("li").length > 20) $("div.recent_div ul li:last").remove();
});

$(document).on("click", "div.header > a.close", function(){
  var parent = $(this).parent();
  var container = $(this).parents(".container");
  var next = parent.next().next();
  if (next.length == 0) next = parent.prev().prev();
  
  parent.next().remove().end().remove();
  container.reset_maxheight();
  
  if (next.length > 0 && container.children("div.expanded").length == 0) next.trigger("toggle");
});

$(document).on("click", "a.close_all", function(){
  $($(this).attr("container")).empty();
});

$(document).on("click", "div.header > a.toggle", function(){
  $(this).parent().trigger("toggle");
});

$(document).on("click", ".globalnav a", function(e){
  e.preventDefault();
  var href = $(this).attr("href");
  if (href.match(/\/favor/)) {  
    
    var array = $.makeArray($("#favor ul li"));
    array.sort(function(a,b){
       var aa = localStorage.getItem($(a).children("a").text().match(/\((\w+)\)/)[1]);
       var bb = localStorage.getItem($(b).children("a").text().match(/\((\w+)\)/)[1]);
       aa = aa? aa: 0;
       bb = bb? bb: 0;
       return bb-aa;
    });
    var ul = $("#favor ul").empty();
    $.each(array, function(i, li){
        ul.append(li);
    });
    return $("#favor").slideToggle();
  }
  if (href.match(/\/(\w+)?/)) load_special($(this));
});

$("#favor").dblclick(function(){ $(this).slideUp(); });

$("#favor").on("click", "a", function(e){
  var $this = $(this);
  e.preventDefault();
  var href = $this.attr("href");
  if (href.match(/\/board/)) {
    if ($("#favor input:checked").length == 0) $("#favor").slideUp();
    load_board($this);
  }
});

$("#wraper").on("click", "a", function(e){
  e.preventDefault();
  var href = $(this).attr("href");
  if (href.match(P_LOAD_BOARD_IN_DIV)) {
    return load_board_in_div($(this));
  }
  if (href.match(P_LOAD_SPEC_IN_DIV)) {
    return load_special_in_div($(this));
  }

  //if (href.match(/#\/article/)) return load_article($(this));
  if (href.match(P_LOAD_ARTICLE)) return load_article($(this));
});

$("#wraper2").on("click", "a", function(e){
  //e.stopPropagation();
  var href = $(this).attr("href");
  if (href.match(/\/board/)) load_board($(this));
  if (href.match(/#\/article/)) load_article_in_div($(this));
  if (href.match(P_ARTICLE_ACTION)) {
    $(this).attr("target", "_blank");
    return true;
  }
  e.preventDefault();

});

$("#wraper").on("dblclick", "div.contents", function(){
  refreshBoard($(this).prev());
});

resize();
} // big function end

installed = true;
$("body").fadeIn();
