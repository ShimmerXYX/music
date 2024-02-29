$(function () {
    const player = $('<audio>');

    const baseURL = 'http://home.softeem.xin:8088/music/listAll';
    let musics = [];
    let currentIndex = 0;
    let now = 0;
    let total = 0;
    let playing = false;
    let loopMode = 0;

    // 点击音乐列表按钮，显示音乐列表对话框
    $('.btn-list').on('click', function () {
        $('#music-list-dialog').fadeIn(300);
    });

    // 点击关闭按钮，隐藏音乐列表对话框
    $('.btn-close').click(function () {
        $('#music-list-dialog').fadeOut(300);
    });

    // 加载音乐列表和绑定事件监听器
    function init() {
        // 加载音乐列表
        $.get(baseURL, function (data) {
            musics = data;
            $.each(musics, (i, e) => {
                $('#music-list').append(`<li data-index="${i}">${e.name}</li>`);
            });
        });

        // 绑定按钮点击事件
        $('.btn-loop').on('click', function () {
            loopMode = (loopMode + 1) % 3;
            updateLoopIcon(loopMode);
        });

        $('.btn-prev').on('click', playPreviousSong);
        $('.btn-next').on('click', playNextSong);

        // 监听歌曲播放完毕事件
        player.on('ended', function () {
            if (loopMode === 2) {
                playSong(currentIndex); // 单曲循环
            } else {
                playNextSong();
            }
        });

        // 音乐列表点击事件
        $('#music-list').on('click', 'li', function () {
            playing = true;
            $('#music-list li.active').removeClass('active');
            currentIndex = $(this).data('index');
            playSong(currentIndex);
        });
    }

    // 更新循环模式图标
    function updateLoopIcon(mode) {
        const icons = ['fa-list', 'fa-random', 'fa-repeat'];
        $('.btn-loop i').removeClass().addClass(`fa ${icons[mode]}`);
    }

    // 播放上一首歌曲
    function playPreviousSong() {
        currentIndex = (currentIndex - 1 + musics.length) % musics.length;
        playSong(currentIndex);
    }

    // 播放下一首歌曲
    function playNextSong() {
        if (loopMode === 1) {
            currentIndex = Math.floor(Math.random() * musics.length); // 随机播放
        } else {
            currentIndex = (currentIndex + 1) % musics.length; // 列表循环
        }
        playSong(currentIndex);
    }

    // 播放指定索引的歌曲
    function playSong(index) {
        let m = musics[index];
        player.prop('src', m.path);
        player.trigger('play');
        $('.music-name').text(m.name);
        $('#music-list li.active').removeClass('active');
        $(`#music-list li[data-index="${index}"]`).addClass('active');
        playing = true;

        // 延迟一段时间后更新专辑图片
        setTimeout(function () {
            $('.cover-img').prop('src', m.ablumImg);
        }, 100);
    }

    // 开始播放音乐
    function startPlay(music) {
        // 标记当前播放器处于播放状态
        playing = true;
        // 主动触发play函数
        player.trigger('play');
        // 实现唱片旋转
        $('.cover').addClass('playing');
        // 在头部显示歌曲名称
        $('.music-name').text(music.name);
        // 播放按钮切换为暂停
        $('.btn-play-pause > i').removeClass('fa-play').addClass('fa-pause');
        // 列表中正在播放的歌曲高亮展示
        $(`li:eq(${currentIndex})`).addClass('active');
        // 同步显示唱片封面图和背景毛玻璃图片
        $('.cover-img, .body-bg').prop('src', music.ablumImg);
    }

    // 监听时间进度条
    player.on('timeupdate', function () {
        now = this.currentTime;
        $('.time-now').text(fmtTime(now));
        // 实时同步进度显示
        $('.progress').css('width', `${now / total * 100}%`);
    });

    // 当音频加载完成时触发
    player.on('loadeddata', function () {
        // 当前的播放进度 
        total = this.duration;
        $('.time-total').text(fmtTime(total));
    });

    // 格式化时间函数
    function fmtTime(t) {
        t = new Date(t * 1000);
        let m = t.getMinutes();
        let s = t.getSeconds();
        m = m < 10 ? `0${m}` : m;
        s = s < 10 ? `0${s}` : s;
        return `${m}:${s}`;
    }

    // 点击进度条
    $('.box-progress').on('click', function (e) {
        let offset = e.offsetX;
        let width = $(this).width();
        now = offset / width * total;
        player.prop('currentTime', now);
    });

    // 点击播放/暂停按钮
    $('.btn-play-pause').on('click', function () {
        if (playing) {
            // 暂停
            player.trigger('pause');
            // 唱片停止旋转
            $('.cover').removeClass('playing');
            // 按钮图标切换为播放
            $('.btn-play-pause > i').removeClass('fa-pause').addClass('fa-play');
            // 标记暂停
            playing = false;
        } else {
            // 继续播放
            startPlay(musics[currentIndex]);
            $(this).find('i').removeClass('fa-play').addClass('fa-pause');
        }
    });

    // 初始化
    init();

});
