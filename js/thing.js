function randrange(a,b) {
	return Math.floor(Math.random()*(b-a)+a);
}

function coin() {
	return Math.random()>0.5;
}

function divisors(n) {
	var d = [];
	var i = 2;
	while(i*i<=n) {
		if(n%i==0) {
			d.push(i);
		}
		i+=1;
	}
	return d;
}

function gcd(a,b) {
	if(a>b){return gcd(b,a);}
	while(a>0) {
		var m = b%a;
		b=a;
		a=m;
	}
	return b;
}

function choice(l) {
	var i = Math.floor(Math.random()*l.length);
	return l[i];
}


var square_it = {
	test: function(n){ return n>1 && n<20 },
	fn: function(n) {
		return [{kind: 'square_it',text:'multiply it by itself',n:n*n}];
	}
}
var cube_it = {
	test: function(n){ return n>1 && n<10 },
	fn: function(n) {
		return [{kind: 'cube_it',text:'multiply it by itself twice',n: n*n*n}];
	}
}

var halve_it = {
	test: function(n,steps,last_move){return n%2==0 && last_move!=double_it},
	fn: function(n) {
		return [{kind: 'halve_it', text: 'halve it', n:n/2}];
	}
}

var double_it = {
	test: function(n,steps,last_move){return last_move!=halve_it},
	fn: function(n) {
		return [{kind: 'double_it', text: 'double it', n:n*2}];
	}
}

var add = {
	test: function(n,steps,last_move){return last_move!=subtract && last_move!=add},
	fn: function(n) {
		var i = randrange(1,20);
		return [{kind: 'add', text: '+'+i, n:n+i}]
	}
}

var subtract = {
	test: function(n,steps,last_move){return n>5 && last_move!=add && last_move!=subtract},
	fn: function(n) {
		var i = randrange(1,Math.min(20,n-5));
		return [{kind: 'subtract', text: '+'+i, n:n+i}]
	}
}

var multiply = {
	test: function(n,steps,last_move){return n<100 && last_move!=divide},
	fn: function(n) {
		var f = randrange(2,Math.min(10,Math.floor(200/n)));
		return [{kind: 'multiply',text: '×'+f, n:n*f}];
	}
}

var divide = {
	test: function(n,steps,last_move) { return n>=10 && steps>=2 && last_move!=multiply },
	fn: function(n) {
		var d = randrange(2,10);
		var m = n%d;
		var o = [];
		if(m) {
			if(n<d || coin()) {
				o.push({kind: 'add', text: '+'+(d-m),n:n+d-m});
				n += d-m;
			} else {
				o.push({kind: 'subtract', text: '-'+m,n:n-m});
				n -= m;
			}
		}
		o.push({kind: 'divide', text: '÷'+d, n: n/d});
		return o;
	}
}

var superscripts = "⁰¹²³⁴⁵⁶⁷⁸⁹";
var subscripts = "₀₁₂₃₄₅₆₇₈₉";

var fraction = {
	test: function(n,steps){ return steps>=2 },
	fn: function(n) {
		var d = randrange(2,10);
		var m = n%d;
		var o = [];
		if(m) {
			if(n<d || coin()) {
				o.push({kind: 'add', text: '+'+(d-m),n:n+d-m});
				n += d-m;
			} else {
				o.push({kind: 'subtract', text: '-'+m,n:n-m});
				n -= m;
			}
		}
		var i = randrange(1,d-1);

		var g = gcd(i,d);
		i /= g;
		d /= g;

		o.push({kind: 'fraction', text: superscripts[i]+'/'+subscripts[d]+' of this', n: n*i/d});
		return o;
	}
}

var ten_percent = {
	test: function(n){return n%10==0},
	fn: function(n) {
		var i = randrange(1,10);
		return [{kind: 'percent', text: (i*10)+'% of this', n: n*i/10}];
	}
}

var levels = {
	'easy': {steps: 9, start: [1,20], moves: [multiply,halve_it,add,subtract,square_it,divide]},
	'medium': {steps: 9, start: [10,100], moves: [multiply,halve_it,double_it,square_it,divide,fraction]},
	'hard': {steps: 9, start: [1,100], moves: [multiply,halve_it,square_it,cube_it,divide,fraction,ten_percent]}
}

function Challenge(difficulty) {
	this.difficulty = difficulty
	this.level = levels[this.difficulty];

	while(!this.moves) {
		try {
			this.make_moves();
		}catch(e) {
		}
	}
	
	this.html = this.make_html();
}
Challenge.prototype = {
	make_moves: function() {
		var steps = this.level.steps;
		var n = this.start = randrange(this.level.start[0], this.level.start[1]);
		var moves = [];
		var last_move = null;
		while(steps>0) {
			var possibles = this.level.moves.filter(function(m){
				return m!=last_move && (m.test===true || m.test(n,steps,last_move))
			});
			if(!possibles.length) {
				throw(new Error("No possible moves"));
			}
			var move = choice(possibles);
			var new_moves = move.fn(n,steps);
			steps -= new_moves.length;
			n = new_moves[new_moves.length-1].n;
			moves = moves.concat(new_moves);
			last_move = move;
		}
		this.moves = moves;
		this.result = n;
		this.time = new Date();
		this.time_remaining = 30;
	},

	make_html: function() {
		var c = this;
		var container = $('<ol class="challenge">');
		container.addClass('difficulty-'+this.difficulty);
		var start = $('<li class="start">');
		start.append($('<span class="text">').text(this.start));
		start.append($('<span class="difficulty">').text(this.difficulty));
		container.append(start);
		for(var i=0;i<this.moves.length;i++) {
			var move_element = $('<li class="move">');
			move_element.addClass(this.moves[i].kind);
			var text_element = $('<span class="text">').text(this.moves[i].text);
			move_element.append(text_element);
			container.append(move_element);
		}
		var result = $('<li class="result">');
		var form = $('<form>');
		var input = $('<input type="number">');
		form.append(input);
		function check_it() {
			c.check(input.val());
		}
		form.on('submit',function() {check_it(); return false});
		result.append(form);
		container.append(result);
		var timer = $('<li class="time">');
		timer.append('<span class="text">');
		timer.on('click',check_it);
		this.timeInterval = setInterval(function() {c.update_time()},50);
		container.append(timer);
		return container;
	},

	update_time: function() {
		var d = new Date();
		var diff = (d - this.time)/1000;
		this.time = d;
		this.time_remaining -= diff;
		var tenths = Math.floor(this.time_remaining*10) % 10;
		var seconds = Math.floor(this.time_remaining);

		if(this.time_remaining<0) {
			seconds = tenths = 0;
			this.end(false);
			this.html.find('.result input').val(this.result);
			game.out_of_time();
		}
		var s = seconds+'.'+tenths+'s';
		this.html.find('.time .text').text(s);
	},

	stop_timing: function() {
		clearInterval(this.timeInterval);
	},

	check: function(n) {
		if(this.correct) {
			return;
		}
		if(n==this.result) {
			this.correct = true;
			this.end(true);
			game.correct();
		} else {
			this.html.find('.result input').val('').focus();
		}
	},

	end: function(correct) {
		this.correct = correct;
		this.html.addClass('finished '+(correct?'correct':'out_of_time'));
		this.html.find('.result input').attr('disabled',true);
		this.stop_timing();
	}
}

function Game() {
	this.difficulty = 'easy';
}
Game.prototype = {
	new_challenge: function() {
		if(this.current_challenge && this.current_challenge.correct===undefined) {
			this.current_challenge.end(false);
		}
		var c = this.current_challenge = new Challenge(this.difficulty);
		$('#challenges').append(c.html);
		c.html.find('.result input').focus();
		window.scrollTo(0,c.html.offset().top);
	},
	correct: function() {
		this.new_challenge();
	},
	out_of_time: function() {
		this.new_challenge();
	}
}

var game = new Game();
$(document).ready(function() {
	$('.another').on('click',function() {
		game.difficulty = $(this).attr('data-difficulty');
		game.new_challenge()
	});
	game.new_challenge();
});

var owidth = null;
function resize() {
	if(window.innerWidth==owidth) {
		return;
	}
	var w = owidth = window.innerWidth;
	var target = 100*13;
	if(w>=target) {
		var size = '20px';
	} else {
		size = 20*w/target;
	}
	$('html').css('font-size',size);
}
$(window).on('resize',resize);
resize();
