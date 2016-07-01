function randrange(a,b) {
	return Math.floor(Math.random()*(b-a)+a);
}
function zfill(n,l) {
	n += '';
	while(n.length<l) {
		n='0'+n;
	}
	return n;
}

function show_time(t) {
	if(t==Infinity) {
		return '';
	}
	var tenths = Math.floor(t*10) % 10;
	var seconds = Math.floor(t)%60;
	var minutes = Math.floor((t-seconds)/60);
	var out = zfill(seconds,2)+'.'+tenths;
	if(minutes>=1) {
		out = zfill(minutes,2)+':'+out;
	}
	return out;
}

var superscripts = "⁰¹²³⁴⁵⁶⁷⁸⁹";
var subscripts = "₀₁₂₃₄₅₆₇₈₉";

function show_script(n,scripts) {
	if(n==0) {
		return scripts[0];
	}
	var s = '';
	while(n) {
		var m = n%10;
		s = scripts[m]+s;
		n=(n-m)/10;
	}
	return s;
}

function show_fraction(n,d) {
	return show_script(n,superscripts)+'/'+show_script(d,subscripts);
}

function coin() {
	return Math.random()>0.5;
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

function weighted_choice(l) {
	var t = 0;
	var keep = null;
	for(var i=0;i<l.length;i++) {
		var o = l[i][0];
		var w = l[i][1];
		var p = w/(t+w);
		if(keep===null || Math.random()<p) {
			keep = o;
		}
		t += w;
	}
	return keep;
}

/*************
 * Operations
 *************
 */

var easy_square_it = {
	test: function(n){ return n>1 && n<=12 },
	fn: function(n) {
		return [{kind: 'square_it',text:'multiply it by itself',n:n*n}];
	}
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
	test: function(n,steps,last_move){return last_move!=halve_it && last_move!=double_it},
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
		return [{kind: 'subtract', text: '-'+i, n:n-i}]
	}
}

// multiply by a single digit, never try to multiply a number bigger than 20
var easy_multiply = {
	test: function(n,steps,last_move){return n<20 && last_move!=divide},
	fn: function(n) {
		var f = randrange(2,10);
		return [{kind: 'multiply',text: '×'+f, n:n*f}];
	}
}

var multiply = {
	test: function(n,steps,last_move){return n<100 && last_move!=divide},
	fn: function(n) {
		var f = randrange(2,Math.min(10,Math.floor(200/n)));
		return [{kind: 'multiply',text: '×'+f, n:n*f}];
	}
}

var easy_divide = {
	test: function(n,steps,last_move) { return n>=10 && n<100 && steps>=2 && last_move!=multiply },
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

		o.push({kind: 'fraction', text: show_fraction(i,d)+' of this', label: i+' / '+d+' of this', n: n*i/d});
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
	'easy': {steps: 9, start: [1,20], moves: [
		[easy_multiply,1],
		[halve_it,2],
		[add,3],
		[subtract,3],
		[easy_square_it,1],
		[easy_divide,1]
	]},
	'medium': {steps: 9, start: [10,100], moves: [
		[multiply,2],
		[halve_it,2],
		[double_it,2],
		[square_it,1],
		[divide,1],
		[fraction,1],
		[subtract,1]
	]},
	'hard': {steps: 9, start: [1,100], moves: [
		[multiply,3],
		[halve_it,2],
		[square_it,2],
		[cube_it,1],
		[divide,2],
		[fraction,1],
		[ten_percent,3],
		[add,1],
		[subtract,1]
	]}
}

var times = [
	[12,function(i){return 5*i}, function(i,s) {return s+' seconds'}],
	[5, function(i){return 10*i+60}, function(i,s) {return s+' seconds'}],
	[9, function(i){return 60*(i+1)}, function(i,s) {return (i+1)+' minutes'}],
	[1, function(i){return Infinity}, function() {return '∞'}]
];

function invert_time(s) {
	var t = 0;
	for(var i=0;i<times.length;i++) {
		if(times[i][1](times[i][0]) >= s) {
			for(var j=1;j<=times[i][0];j++) {
				if(times[i][1](j)>=s) {
					return j+t;
				}
			}
		}
		t += times[i][0];
	}
}


function Challenge(difficulty,time_limit) {
	this.difficulty = difficulty;
	this.time_limit = time_limit;
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
				return m!=last_move && (m[0].test===true || m[0].test(n,steps,last_move))
			});
			if(!possibles.length) {
				throw(new Error("No possible moves"));
			}
			var move = weighted_choice(possibles);
			var new_moves = move.fn(n,steps);
			steps -= new_moves.length;
			n = new_moves[new_moves.length-1].n;
			moves = moves.concat(new_moves);
			last_move = move;
		}
		this.moves = moves;
		this.result = n;
		this.time = new Date();
		this.time_remaining = this.time_limit;
        this.time_taken = 0;
	},

	make_html: function() {
		var c = this;
		var container = $('<ol class="challenge">');
		container.addClass('difficulty-'+this.difficulty);
		var start = $('<li class="bit step start">');
		start.append($('<span class="difficulty">').text(this.difficulty));
		start.append($('<span class="text" tabindex="1">').text(this.start));
		container.append(start);
		for(var i=0;i<this.moves.length;i++) {
			var move_element = $('<li class="bit step move">');
			move_element.addClass(this.moves[i].kind);
			var text_element = $('<span class="text" tabindex="1">').text(this.moves[i].text);
			if(this.moves[i].label) {
				text_element.attr('aria-label',this.moves[i].label);
			}
			move_element.append(text_element);
			container.append(move_element);
		}
		var result = $('<li class="bit result">');
		var form = $('<form>');
		var input = $('<input type="number" tabindex="1" title="Answer">');
		form.append(input);
		function check_it() {
			c.check(input.val());
		}
		form.on('submit',function(e) {e.preventDefault(); check_it(); return false});
		result.append(form);
		container.append(result);
		var timer = $('<li class="bit time">');
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
        this.time_taken += diff;
        var display;
        if(this.time_limit!==Infinity) {

            if(this.time_remaining<0) {
                this.time_remaining = 0;
                this.end(false);
            }
        }
        display = show_time(this.time_taken);
		this.html.find('.time .text').text(display);
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
			game.new_challenge();
		} else {
			this.html.find('.result input').val('').focus();
		}
	},

	end: function(correct) {
		this.correct = correct;
		this.html.find('.result input').val(this.result);
		this.html.addClass('finished '+(correct?'correct':'out_of_time'));
		this.html.find('.result input').attr('disabled',true);
		this.stop_timing();
		game.end_game();
	}
}

function Game() {
	this.difficulty = 'easy';
	this.focus = 'answer';
	this.scores = {};
	for(var difficulty in levels) {
		this.scores[difficulty] = {streak: 0, correct: 0, attempted: 0, total_time: 0, average_time: null};
	}
	this.load();
}
Game.prototype = {
	version: 1,
	time_limit: 30,

	set_time_limit: function(i) {
		for(var j=0;j<times.length;j++) {
			if(i<=times[j][0]) {
				var s = times[j][1](i);
				$('#time_limit-display').text(times[j][2](i,s));
				this.time_limit = s;
				break;
			} else {
				i -= times[j][0];
			}
		}
	},

	new_challenge: function() {
        $('body').addClass('started');
		if(this.current_challenge && this.current_challenge.correct===undefined) {
			this.current_challenge.end(false);
		}
		var c = this.current_challenge = new Challenge(this.difficulty,this.time_limit);
		$('#challenges').append(c.html);
		switch(this.focus) {
		case 'answer':
			c.html.find('.result input').focus();
			break;
		case 'start':
			c.html.find('.start .text').focus();
			break;
		}
		window.scrollTo(0,c.html.offset().top);
	},

	end_game: function() {
		var c = this.current_challenge;
		var score = this.scores[c.difficulty];

		score.attempted += 1;

		if(c.correct) {
			score.correct += 1;
			score.streak += 1;
			score.total_time += c.time_taken;
			score.average_time = score.total_time/score.correct;
		} else {
			score.streak = 0;
		}

		this.summarise(this.difficulty);
		this.save();
	},

	summarise: function(difficulty) {
		var score = this.scores[difficulty];
		var summary_element = $('<li class="summary"><span class="score">'+show_fraction(score.correct,score.attempted)+'</span> '+difficulty+' puzzles solved'+(score.streak>0 ? ' <span class="streak">(streak '+score.streak+')</span>':'')+'. Average time <span class="average_time">'+(score.average_time!==null ? show_time(score.average_time) : '∞')+'</span>');
		$('#challenges').append(summary_element);
	},

	load: function() {
		if(!(window.localStorage && localStorage.thirtysecondchallenge)) {
			return;
		}
		var data = JSON.parse(localStorage.thirtysecondchallenge);
		if(data.version!=this.version) {
			return;
		}
		this.scores = data.scores;
		this.difficulty = data.difficulty;
		this.time_limit = data.time_limit=='infinity' ? Infinity : data.time_limit;

		for(var difficulty in this.scores) {
			this.summarise(difficulty);
		}
	},

	save: function() {
		if(!window.localStorage) {
			return;
		}

		var data = {
			version: this.version,
			scores: this.scores,
			difficulty: this.difficulty,
			time_limit: this.time_limit==Infinity ? 'infinity' : this.time_limit
		}

		localStorage.thirtysecondchallenge = JSON.stringify(data);
	},

    reset: function() {
		if(!(window.localStorage && localStorage.thirtysecondchallenge)) {
			return;
		}
        delete localStorage.thirtysecondchallenge;
        $('#challenges').html('');
    }
}

var game;
$(document).ready(function() {
	game = new Game();
	$('.new-challenge').on('click',function() {
		game.difficulty = $(this).attr('data-difficulty');
		game.new_challenge()
	});
	$('#focus_toggle').on('change',function() {
		game.focus = $(this).prop('checked') ? 'start' : 'input';
	});
	$('#time_limit').on('input',function() {
		game.set_time_limit($(this).val());
		game.save();
	}).val(invert_time(game.time_limit)).trigger('input');
    $('#reset').on('click',function() {
        if(confirm("Delete all your saved scores and start again?")) {
            game.reset();
            game = new Game();
        }
    });
	//game.new_challenge();
});
