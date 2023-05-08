const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const player = $('.player');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Cuối cùng thì',
            singer: 'Jack',
            path: './assets/music/song1.mp3.mp3',
            image: './assets/img/song1.jpg'
        },
        {
            name: 'Weating for you',
            singer: 'Mono',
            path: './assets/music/song2.mp3.mp3',
            image: './assets/img/song2.jpg'
        },
        {
            name: 'Chuyện đôi ta',
            singer: 'Muội',
            path: './assets/music/song3.mp3.mp3',
            image: './assets/img/song3.jpg'
        },
        {
            name: 'Đáp án cuối cùng',
            singer: 'Quân AP',
            path: './assets/music/song4.mp3.mp3',
            image: './assets/img/song4.jpg'
        },
        {
            name: 'Tệ thật, Anh nhớ em',
            singer: 'Thanh Hưng',
            path: './assets/music/song5.mp3.mp3',
            image: './assets/img/song5.jpg'
        },
        {
            name: 'Nàng Thơ',
            singer: 'Hoàng Dũng',
            path: './assets/music/song6.mp3.mp3',
            image: './assets/img/song6.jpg'
        },
        {
            name: 'Và ngày nào đó',
            singer: 'Trung Quân idol',
            path: './assets/music/song7.mp3.mp3',
            image: './assets/img/song7.jpg'
        },
        {
            name: 'Ánh sao và bầu trời',
            singer: 'R.I.M',
            path: './assets/music/song8.mp3.mp3',
            image: './assets/img/song8.jpg'
        },
        {
            name: 'Gác lại âu lo',
            singer: 'DaLab',
            path: './assets/music/song9.mp3.mp3',
            image: './assets/img/song9.jpg'
        },
        {
            name: 'Tự tình 2',
            singer: 'Trung Quân idol',
            path: './assets/music/song10.mp3.mp3',
            image: './assets/img/song10.jpg'
        },
        {
            name: 'Em không khóc',
            singer: 'Buitruonglinh',
            path: './assets/music/song11.mp3.mp3',
            image: './assets/img/song11.jpg'
        },
    
        
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                       <h3 class="title">${song.name}</h3>
                       <p class="author">${song.singer}</p>
                     </div>
                    <div class="option">
                       <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        })
        playlist.innerHTML = htmls.join('');
    },
    defineProperty: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lí CD quay / dừng
        const cdThumAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        })
        cdThumAnimate.pause();

        // Xử lí phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lí khi click Play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
               audio.play();
            }
        }

        // khi song được play 
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumAnimate.play();
        }

        // khi song bị pause 
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumAnimate.pause();
        }

        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // Xử lí khi tua Song 
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        // Khi next song
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Khi prev song
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Xử lí bật / tắt Random song
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lí next song khi audio ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option')) {
                
                // Xử lí khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }

                // Xử lí khi click vào option
                if(e.target.closest('.option')) {

                }
            }
        }

        // Xử lí bật / tắt Repeat song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 300)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong()
    },
    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong()
    },
    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        // Định nghĩa các thuộc tính cho object
        this.defineProperty()

        // Lắng nghe và sử lí các sự kiện
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle('active', _this.isRandom);
        repeatBtn.classList.toggle('active', _this.isRepeat);
    },
    
}
app.start();