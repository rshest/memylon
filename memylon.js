//  a list of animations played in sequence
AnimSequence = function () {
    this.anims = [];
    this.curAnim = 0;
    this.curTime = 0;
};

AnimSequence.prototype.add = function (updateFn, duration, startParam) {
    this.anims.push({updateFn: updateFn, duration: duration, startParam: startParam});
};

AnimSequence.prototype.update = function (dt, updateParam) {
    var anim = this.anims[this.curAnim];
    this.curTime += dt;
    if (anim.duration && this.curTime >= anim.duration) {
        anim.updateFn(1, anim.startParam, updateParam);
        if (this.curAnim < this.anims.length - 1) {
            this.curTime = 0;
            this.curAnim++;
        }
    } else {
        anim.updateFn(anim.duration && this.curTime/anim.duration, anim.startParam, updateParam);
    }
};

var Utils = {
    //  Randomly shuffles the array using Fisher-Yates algorithm
    shuffleArray : function (arr) {
        for (var i in arr) {
            var k = Math.floor(Math.random()*i);
            var val = arr[k];
            arr[k] = arr[i];
            arr[i] = val;
        }
    },
    
    //  Returns true if all elements of the array satisfy the given predicate
    every : function (arr, predicate) {
        for (var i in arr) {
            if (!predicate(arr[i])) return false;
        }
        return true;
    },
    
    //  Linear interpolation between a and b with factor t
    lerp : function (a, b, t) {
        return a + t*(b - a);
    },
    
    //  Append parameters in "params" with default values from "defaults"
    setDefaults : function (params, defaults) {
        for (var i in defaults) {
            if (params[i] == undefined) {
                params[i] = defaults[i];
            }
        }
    },
    
    //  Poor man's jQuery
    $ : function (id) {
        return document.getElementById(id);
    }
}

//  the game's module
var Memylon = function() {
    var FRAME_TIME = 50, FLASH_TIME = 1000;
    var CARD_W = 64, CARD_H = 60, CARDS_IN_ROW = 9, CARDS_NUM_VARIATIONS = 53;
    var FLIP_TIME = 500, HIDE_TIME = 500, SHOW_TIME = 300;
    var CARD_NAMES = ['Lua', 'Erlang', 'Clojure', 'Factor', 'D', 'Scratch', 'Self',
        'PowerShell', 'Haskell', 'Java', 'Ruby', 'Scala', 'Ada', 'Smalltalk',
        'Mathematica', 'Ioke', 'Squirrel', 'Perl6', 'Tcl', 'REBOL', 'C++',
        'Eiffel', 'Groovy', 'Io', 'Mercury', 'VBA', 'PHP', 'Oz', 'Lisp', 'J',
        'Boo', 'Delphi', 'Pure', 'Qi', 'Coq', 'Fortran', 'Curl', 'Clean', 
        'Curry', 'LaTEX', 'C', 'Miranda', 'R', 'Squeak', 'Go', 'Python',
        'ECMAScript', 'CaML', 'JavaScript', 'Nemerle','Prolog', 'AliceML', 'Logo'];
        
    var cards  = [], anims = [];
    var numCardsW = 6, numCardsH = 4;
    var prevIdx = -1;
    var numMisses = 0;
    var canInteract = false;
    var bgImage, cardsImage;
    var context;
    
    function init() {
        bgImage = Utils.$("bg");
        cardsImage = Utils.$("cards");
        
        var canvas = Utils.$('gameArea');
        if (canvas && canvas.getContext) {
            context = canvas.getContext('2d');
            Utils.$('restartGame').onclick = function () { 
                this.value = 'Restart';
                resetGame();
            };
            canvas.addEventListener('mousedown', function (e) { 
					onMouseClick(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
				}, false);
            setInterval(updateBoard, FRAME_TIME);
        }
    }
    
    //  draws a single card
    function drawCard(cardID, x, y, scaleX, scaleY) {
        var glyphID = cardID > 0 ? cardID : 0;
        var cx = x + CARD_W*(1 - scaleX)/2;
        var cy = y + CARD_H*(1 - scaleY)/2;
        var glyphX = (glyphID%CARDS_IN_ROW)*CARD_W;
        var glyphY = Math.floor(glyphID/CARDS_IN_ROW)*CARD_H;
        
        context.drawImage(cardsImage, 
            glyphX, glyphY, CARD_W, CARD_H, 
            cx, cy, CARD_W*scaleX, CARD_H*scaleY);    
    }
    
    //  plays a "flash cards" animation 
    function flashCards() {
        canInteract = false;
        for (var i in cards) {
            var card = cards[i];
            var startDelay = (i%numCardsW + 1)*80;
            var flashTime = FLASH_TIME*numCardsW;
            card.anim = anim(
                ['pose', startDelay, card.id],
                ['flip', FLIP_TIME,  card.id],
                ['pose', flashTime, -card.id],
                ['flip', FLIP_TIME, -card.id]);
        }
        anims = [anim(['exec', numCardsW*80 + FLIP_TIME*2 + flashTime, 
            function () { canInteract = true; }])];
    }
    
    //  set of the game-specific animation update functions
    var AnimFunctions = {
        //  "draw static card" animation
        pose : function(t, cardID, card) {
            drawCard(cardID, card.x, card.y, 1, 1); 
        },
        //  "flip card" animation
        flip : function(t, cardID, card) { 
            var scale = Math.cos(Math.PI*t);
            var id = (scale > 0) ? cardID : -cardID;
            drawCard(id, card.x, card.y, Math.abs(scale), 1); 
        },
        //  "dissolve card" animation
        hide : function(t, cardID, card) {
            if (t < 1) {
                context.globalAlpha = 1 - t;
                drawCard(cardID, card.x, card.y, 1, 1); 
                context.globalAlpha = 1;
            }
        },
        //  flying text animation
        text : function (t, params) { 
            //  append missing parameters with defaults
            Utils.setDefaults(params, {sizeFrom: 10, xFrom: 182, yFrom: 150, alphaFrom: 1, 
                font: 'Arial', bold: true, color: '#2222AA'});
            Utils.setDefaults(params, {sizeTo: params.sizeFrom, alphaTo: params.alphaFrom, 
                xTo: params.xFrom, yTo: params.yFrom});
            //  interpolate current text parameters
            var size = Utils.lerp(params.sizeFrom, params.sizeTo, t);
            var x = Utils.lerp(params.xFrom, params.xTo, t);
            var y = Utils.lerp(params.yFrom, params.yTo, t);
            var alpha = Utils.lerp(params.alphaFrom, params.alphaTo, t);
                    
            //  draw text
            context.font         = (params.bold ? 'bold ' : '') + size + 'px ' + params.font;
            context.fillStyle    = params.color;
            context.textBaseline = 'middle';
            context.textAlign    = 'center';
            context.globalAlpha  = alpha;
            context.fillText(params.text, x, y);
            context.globalAlpha = 1;
        },
        //  executes a function at the end of animation period
        exec : function(t, fn) {
            if (t === 1) {
                fn();
            }
        },
        //  empty "spin doing nothing" animation
        wait : function(t) {
        }
    };
    
    function anim() {
        var arg, animType, duration, param;
        var anim = new AnimSequence();
        for (var i = 0, nArg = arguments.length; i < nArg; i++) {
            arg = arguments[i];
            animType = arg[0];
            duration = arg[1];
            param = arg[2];
            anim.add(AnimFunctions[animType], duration, param);    
        }
        return anim;
    }
    
    //  plays the "game is won" scene
    function playFinalScene(cardID) {
        var xCenter = 190;
        anims = [
            anim(['wait', 1000], ['text', 500, {
                text: 'This is it.', 
                color: '#5F5B60', alphaTo: 0.8,
                yFrom: 30, xFrom: 400, xTo: xCenter, 
                sizeFrom: 50
            }]),
            anim(['wait', 2000], ['text', 700, {
                text: 'the language wars', 
                color: '#735551', 
                yFrom: 75, xFrom: -200, xTo: xCenter, 
                sizeFrom: 30
            }]),
            anim(['wait', 2700], ['text', 1000, {
                text: 'ARE OVER.', 
                color: '#81878C', 
                xFrom: xCenter, yTo: 120, 
                sizeFrom: 0, sizeTo: 40
            }]),
            anim(['wait', 5000], ['text', 1500, {
                text: 'and the winner is...', 
                color: '#B2A89B', 
                xFrom: 500, xTo: xCenter, yFrom: 160, 
                sizeFrom: 30
            }]),
            anim(['wait', 6500], ['text', 5000, {
                text: CARD_NAMES[Math.abs(cardID) - 1], 
                color: '#D91122', 
                xFrom: -100, xTo: xCenter, yFrom: 210, 
                sizeFrom: 0, sizeTo: 55
            }])];
    }
    
    function onMouseClick(x, y) {
        var cardIdx = Math.floor(x/CARD_W) + numCardsW*Math.floor(y/CARD_H);
        var card = cards[cardIdx];
        if (canInteract && card && (cardIdx !== prevIdx) && (card.id !== 0)) {
            if (prevIdx === -1) {
                //  no cards are flipped yet
                prevIdx = cardIdx;
                card.anim = anim(['flip', FLIP_TIME, card.id]);
                card.id = -card.id;
            } else {
                var prevCard = cards[prevIdx];
                if (Math.abs(card.id) === Math.abs(prevCard.id)) {
                    //  the match is found
                    
                    //  animation for the already flipped card: wait and dissolve
                    prevCard.anim = 
                        anim(['pose', FLIP_TIME, prevCard.id],
                             ['hide', HIDE_TIME, prevCard.id]);
                    //  animation for the current card: flip and dissolve
                    card.anim = 
                        anim(['flip', FLIP_TIME, card.id],
                             ['hide', HIDE_TIME, -card.id]);
                    //  animation of the flying card caption
                    anims = [anim(['text', 2000, {
                        text: CARD_NAMES[Math.abs(card.id) - 1], 
                        alphaFrom: 1, alphaTo: 0.01, 
                        sizeFrom: 10, sizeTo: 300}], ['wait'])];
                    var cardID = card.id;
                    prevCard.id = card.id = 0;
                    if (Utils.every(cards, function (card) { return (card.id === 0); })) {
                        //  all matches are found, show the final scene animation
                        playFinalScene(cardID);
                    } 
                } else {
                    //  animation for the already flipped card: wait and flip back 
                    prevCard.anim = 
                        anim(['pose', FLIP_TIME + SHOW_TIME, prevCard.id],
                             ['flip', FLIP_TIME,  prevCard.id],
                             ['pose', undefined, -prevCard.id]);                    
                    //  animation for the current card: flip, wait, flip back 
                    card.anim = 
                        anim(['flip', FLIP_TIME,  card.id],
                             ['pose', SHOW_TIME, -card.id],
                             ['flip', FLIP_TIME, -card.id],
                             ['pose', undefined,  card.id]);
                    prevCard.id = -prevCard.id;
                    setNumMisses(numMisses + 1); 
                }
                prevIdx = -1;
            }
        }
    }
    
    //  sets the game board into the initial state
    function resetGame() {
        var ids, i, idx1, idx2;
        
        //  generate a random subset of card variations
        ids = [];
        for (i = CARDS_NUM_VARIATIONS - 1; i >= 0; i--) ids[i] = i + 1;
        Utils.shuffleArray(ids);
        cards = [];
        
        for (i = numCardsW*numCardsH - 1; i >= 0; i--) {
            cards[i] = {
                id   : -ids[Math.floor(i/2)],
                anim : anim(['pose'])
            }
        }
        Utils.shuffleArray(cards);
        
        //  cache the card positions
        for (i in cards) {
            cards[i].x = (i%numCardsW)*CARD_W;
            cards[i].y = Math.floor(i/numCardsW)*CARD_H;
        }
        
        setNumMisses(0);
        anims = [];
        prevIdx = -1;
        
        flashCards();
    }
    
    //  updates/draws the game board
    function updateBoard () {
        var i;
        context.drawImage(bgImage, 0, 0);
        for (i in cards) {
            var card = cards[i];
            card.anim && card.anim.update(FRAME_TIME, card);
        }    
        for (i in anims) {
            anims[i] && anims[i].update(FRAME_TIME);
        }      
    }
    
    function setNumMisses(num) {
        numMisses = num;
        Utils.$('attemptsCounter').innerHTML = numMisses;
    }    
    
    return {
        init : init
    }
}();

//  the entry point
window.onload = function () {
    Memylon.init();
}
