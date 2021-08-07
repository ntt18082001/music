'use strict'

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'player_';

const cd = $(".cd");
const nameHeading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $("#audio");
const btnPlay = $(".btn-toggle-play");
const progress = $("#progress");

const btnNext = $(".btn-next");
const btnPrev = $(".btn-prev");
const btnRandom = $('.btn-random');
const btnRepeat = $(".btn-repeat");

const listSong = $(".playlist");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Hãy Trao Cho Anh',
            singer: 'Sơn Tùng MTP',
            path: './mp4/Hãy-Trao-Cho-Anh.mp3',
            image: './img/1562051254964_500.jpg'
        },
        {
            name: 'Muộn Rồi Mà Sao Còn',
            singer: 'Sơn Tùng MTP',
            path: './mp4/Muộn-Rồi-Mà-Sao-Còn.mp3',
            image: './img/1619691182261_500.jpg'
        },
        {
            name: 'Em Của Ngày Hôm Qua',
            singer: 'Sơn Tùng MTP',
            path: './mp4/Em-Của-Ngày-Hôm-Qua.mp3',
            image: './img/1511029438465_500.jpg'
        },
        {
            name: 'Chạy Ngay Đi (Onionn Remix)',
            singer: 'Sơn Tùng MTP',
            path: './mp4/Chạy-Ngay-Đi-(Onionn-Remix).mp3',
            image: './img/1530757472153_500.jpg'
        },
        {
            name: 'Túy Âm',
            singer: 'Xesi x Masew x Nhat Nguyen',
            path: './mp4/Tuy-Am-Xesi-Masew-Nhat-Nguyen.mp3',
            image: './img/f9c0475ec02716554fba3f63e5b4ac37_1504991428.jpg'
        },
        {
            name: 'Senorita',
            singer: 'Camila Cabello',
            path: './mp4/Señorita.mp3',
            image: './img/1561114102335_500.jpg'
        },
        {
            name: 'Havana',
            singer: 'Camila Cabello',
            path: './mp4/Havana.mp3',
            image: './img/1502075660969_500.jpg'
        },
        {
            name: '1 Phút',
            singer: 'Andiez',
            path: './mp4/1-Phut-Andiez.mp3',
            image: './img/fd4276c762a53e86ec980bb373a5a805_1504774753.jpg'
        },
        {
            name: 'Yêu 5',
            singer: 'Rhymastic',
            path: './mp4/Yeu-5-Rhymastic.mp3',
            image: './img/b5aa78aa102467e5648160a4ac93df8e_1486467660.jpg'
        },
        {
            name: 'Níu Duyên',
            singer: 'Lê Bảo Bình',
            path: './mp4/Níu-Duyên.mp3',
            image: './img/1607308157174_500.jpg'
        }
    ],
    setConfig: function(key, value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function(){
        const htmls = this.songs.map((song, index) => {
             return `<div class="song ${index === this.currentIndex ? 'activeSong' : ''}" data-index="${index}">
                       <div class="thumb" style="background-image: url('${song.image}')"></div>
                       <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                             <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>`;
        });
        listSong.innerHTML = htmls.join('');
    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        });
    },
    handleEvents: function(){
        const _this = this;
        const cdWidth = cd.offsetWidth;

        const animateRotate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity 
        });
        animateRotate.pause();
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };
        btnPlay.onclick = function(ev){
            if(_this.isPlaying){
                audio.pause();
            } else {
                audio.play();
            }
        };
        audio.onplay = function(){
            _this.isPlaying = true;
            $(".player").classList.add('playing');
            animateRotate.play();
        };
        audio.onpause = function(){
            _this.isPlaying = false;
            $(".player").classList.remove('playing');
            animateRotate.pause();
            
            if(_this.isRandom && this.ended){
                _this.randomSong();
                _this.loadCurrentSong();
                _this.render();
                audio.play();
            } else if(this.ended && _this.isRepeat){
                _this.repeatSong();
                _this.loadCurrentSong();
                _this.render();
                audio.play();
            } else if(this.ended) {
                _this.nextSong();
            }
        };
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        };
        progress.onchange = function(ev){
            const changeTime = audio.duration / 100 * ev.target.value;
            audio.currentTime = changeTime;
        };
        btnNext.onclick = function(){
            progress.value = 0;
            _this.nextSong();
        };
        btnPrev.onclick = function(){
            progress.value = 0;
            _this.prevSong();
        };
        btnRandom.onclick = function(){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            this.classList.toggle('activeRandom');
            if(_this.isRepeat){
                _this.isRepeat = !_this.isRepeat;
                _this.setConfig('isRepeat', _this.isRepeat);
                btnRepeat.classList.toggle('activeRandom');
            }
        };
        btnRepeat.onclick = function(){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            this.classList.toggle('activeRandom');
            if(_this.isRandom){
                _this.isRandom = !_this.isRandom;
                _this.setConfig('isRandom', _this.isRandom);
                btnRandom.classList.toggle('activeRandom');
            }
        };
        listSong.onclick = function(ev) {
            const song = ev.target.closest('.song:not(.activeSong)');
            if(song){
                _this.currentIndex = parseInt(song.getAttribute('data-index'));
                _this.loadCurrentSong();
                _this.render();
                audio.play();
            }
        };
        window.onbeforeunload = function(){
            _this.setConfig('progressValue', progress.value);
            _this.setConfig('currentTimeSong', audio.currentTime);
        };
    },
    loadCurrentSong: function(){
        nameHeading.innerText = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.setAttribute('src', this.currentSong.path);
        this.setConfig('indexSong', this.currentIndex);
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        progress.value = this.config.progressValue;
        audio.currentTime = this.config.currentTimeSong;
        this.currentIndex = parseInt(this.config.indexSong);
    },
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex > this.songs.length - 1){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        this.render();
        audio.play();
    },
    prevSong: function(){
        this.currentIndex--;
        if(this.currentIndex <= 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong();
        this.render();
        audio.play();
    },
    randomSong: function(){
        this.currentIndex = Math.floor(Math.random() * ((this.songs.length - 1) - 0 + 1)) + 0;
    },
    repeatSong: function() {
        this.currentIndex = this.currentIndex;
    },
    start: function(){
        this.loadConfig();
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();
        this.render();
        btnRepeat.classList.toggle('activeRandom', this.isRepeat);
        btnRandom.classList.toggle('activeRandom', this.isRandom);
    }  
};
app.start();