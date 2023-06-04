(() => {
    const $ = mdui.$;
    let firstSquish = true;

    const LANGUAGES = {
        "_": { defaultLanguage: "cn", defaultVOLanguage: "cn" },
		"cn": {
            audioList: [
                // TODO audio random weight
                "audio/cn/gululu.mp3",
                "audio/cn/gururu.mp3",
                "audio/cn/转圈圈.mp3",
                "audio/cn/转圈圈咯.mp3",
                "audio/cn/要坏掉了.mp3"
            ],
            texts: {
                "page-title": "尼奈转圈圈",
                "doc-title": "咕噜噜~",
                "page-descriptions": "给尼奈酱写的小网站，对，就是那个<del>烦人的</del>最可爱的B站虚拟UP主！",
                "counter-descriptions": ["尼奈已经咕噜噜~了", "尼奈已经转了"],
                "counter-unit": ["次", "次圈圈"],
                "counter-button": ["转圈圈~", "咕噜噜！"],
                "access-via-pages": "您目前是通过 GitHub Pages 访问。对于中国大陆或其他一些地区的用户，请<a href='https://herta.ft2.ltd/'>单击此处访问 国内服务器 上的镜像</a>。",
                "access-via-mirror": "恭喜！你正在使用镜像站，这应当会加速在中国大陆及部分地区境内的访问。点此<a href='https://duiqt.github.io/nine_kuru/'>访问 GitHub Pages 上的源站</a>。",
                "show-credits-text": "查看感谢页",
                "repository-desc": "GitHub 仓库",
                "options-txt-vo-lang": "语音语言",
                "options-txt-lang": "界面语言",
                "dialogs-close": "关闭",
                "dialogs-credits-title": "制作人员名单"
            },
            cardImage: "img/card_cn.jpg"
        },
        "ja": {
            audioList: [
                "audio/ja/kuruto.mp3",
                "audio/ja/kuru1.mp3",
                "audio/ja/kuru2.mp3",
            ],
            texts: {
                "page-title": "ようこそ、ニナイへ~",
                "doc-title": "クル クル~",
                "page-descriptions": "このサイトは、ナインのために作られました、 あの BiliBili VTB <del>悩ましい</del> かわいい米粒の虫",
                "counter-descriptions": "全世界のクル再生数",
                "counter-unit": "回",
                "counter-button": "クル クル~!",
                "access-via-pages": "今アクセスしてるページはぎGitHubです。中国大陸まだは他の地域のユーサーはNetlifyのミラーに入るために、<a href='https://herta.ft2.ltd/'>ここにクリックして</a>ください。",
                "access-via-mirror": "おめでとうございます！今はもうミラーサイトを使っています、中国大陸まだは他の地域のアクセス速度が速くなります。サイトのソースを見たいなら、<a href='https://duiqt.github.io/herta_kuru/'>ここにクリックして</a>、GitHubページで見てください。",
                "show-credits-text": "Show Credits",
                "repository-desc": "GitHub Repo",
                "options-txt-vo-lang": "Voice-Over Language",
                "options-txt-lang": "Page Language",
                "dialogs-close": "Close",
                "dialogs-credits-title": "Credits"
            },
            cardImage: "img/card_ja.jpg"
        },
    };

    // This code tries to retrieve the saved language 'lang' from localStorage. If it is not found or if its value is null, then it defaults to "en". 
    var current_language = localStorage.getItem("lang") || LANGUAGES._.defaultLanguage;
    var current_vo_language = localStorage.getItem("volang") || LANGUAGES._.defaultVOLanguage;

    // function that takes a textId, optional language and whether to use fallback/ default language for translation. It returns the translated text in the given language or if it cannot find the translation, in the default fallback language.
    function getLocalText(textId, language = null, fallback = true) {
        let curLang = LANGUAGES[language || current_language];
        let localTexts = curLang.texts;
        if (localTexts[textId] !== undefined) {
            let value = localTexts[textId];
            if (value instanceof Array) {
                return randomChoice(value); // if there are multiple translations available for this text id, it randomly selects one of them and returns it.
            } else {
                return value;
            }
        }
        if (fallback) return getLocalText(textId, language = "en", fallback = false);
        else return null;
    }

    // function that updates all the relevant text elements with the translations in the chosen language.
    function multiLangMutation() {
        let curLang = LANGUAGES[current_language];
        let localTexts = curLang.texts;
        Object.entries(localTexts).forEach(([textId, value]) => {
            if (!(value instanceof Array))
                if (document.getElementById(textId) != undefined)
                    document.getElementById(textId).innerHTML = value; // replaces the innerHTML of the element with the given textId with its translated version.
        });
        refreshDynamicTexts()
        document.getElementById("herta-card").src = curLang.cardImage; // sets the image of element with id "herta-card" to the translated version in the selected language.
    }

    multiLangMutation() // the function multiLangMutation is called initially when the page loads.

    // This adds an event listener on the language-selector element which updates the selected interface language, saves it on the localStorage and calls multiLangMutation to update all translations accordingly.
    // $("#language-selector").on("change", (ev) => {
    //     current_language = ev.target.value;
    //     localStorage.setItem("lang", ev.target.value);
    //     multiLangMutation();
    // });

    // function that returns the list of audio files for the selected language
    function getLocalAudioList() {
        return LANGUAGES[current_vo_language].audioList;
    }

    // get global counter element and initialize its respective counts
    const localCounter = document.querySelector('#local-counter');
    let localCount = localStorage.getItem('count-v2') || 0;

    // display counter
    localCounter.textContent = localCount.toLocaleString('en-US');

    // initialize timer variable and add event listener to the counter button element
    const counterButton = document.querySelector('#counter-button');
    counterButton.addEventListener('click', (e) => {
        localCount++;

        localCounter.textContent = localCount.toLocaleString('en-US');

        triggerRipple(e);

        playKuru();
        animateHerta();
        refreshDynamicTexts();
    });

    // initialize cachedObjects variable to store cached object URLs
    var cachedObjects = {};

    // function to try caching an object URL and return it if present in cache or else fetch it and cache it
    function tryCacheUrl(origUrl) {
        if (cachedObjects[origUrl]) {
            return cachedObjects[origUrl];
        } else {
            setTimeout(() => {
                fetch(origUrl)
                    .then((response) => response.blob())
                    .then((blob) => {
                        const blobUrl = URL.createObjectURL(blob);
                        cachedObjects[origUrl] = blobUrl;
                    })
                    .catch((error) => {
                        console.error(`Error caching object from ${origUrl}: ${error}`);
                    });
            }, 1);
            return origUrl;
        }
    };

    // try caching the hertaa1.gif and hertaa2.gif images by calling the tryCacheUrl function
    tryCacheUrl("img/nine1.gif");
    tryCacheUrl("img/nine2.gif");

    // Define a function that takes an array as an argument and returns a random item from the array
    function randomChoice(myArr) {
        const randomIndex = Math.floor(Math.random() * myArr.length);
        const randomItem = myArr[randomIndex];
        return randomItem;
    }

    // Define a function that shuffles the items in an array randomly using Fisher-Yates algorithm
    function randomShuffle(myArr) {
        for (let i = myArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [myArr[i], myArr[j]] = [myArr[j], myArr[i]];
        }
        return myArr;
    }


    function getRandomAudioUrl() {
        var localAudioList = getLocalAudioList();
        if (current_vo_language == "ja") {
            const randomIndex = Math.floor(Math.random() * 2) + 1;
            return localAudioList[randomIndex];
        }
        const randomIndex = Math.floor(Math.random() * localAudioList.length);
        return localAudioList[randomIndex];
    }

    function playKuru() {
        let audioUrl;
        if (firstSquish) {
            firstSquish = false;
            audioUrl = getLocalAudioList()[0];
        } else {
            audioUrl = getRandomAudioUrl();
        }
        let audio = new Audio(tryCacheUrl(audioUrl));
        audio.play();
        audio.addEventListener("ended", function () {
            this.remove();
        });
    }

    function animateHerta() {
        let id = null;
        const random = Math.floor(Math.random() * 2) + 1;
        const elem = document.createElement("img");
        elem.src = tryCacheUrl(`img/nine${random}.gif`);
        elem.style.position = "absolute";
        elem.style.right = "-500px";
        elem.style.top = counterButton.getClientRects()[0].bottom + scrollY - 430 + "px"
        elem.style.zIndex = "-10";
        document.body.appendChild(elem);

        let pos = -500;
        const limit = window.innerWidth + 500;
        clearInterval(id);
        id = setInterval(() => {
            if (pos >= limit) {
                clearInterval(id);
                elem.remove()
            } else {
                pos += 20;
                elem.style.right = pos + 'px';
            }
        }, 12);
    };



    // This function creates ripples on a button click and removes it after 300ms.
    function triggerRipple(e) {
        let ripple = document.createElement("span");

        ripple.classList.add("ripple");

        const counter_button = document.getElementById("counter-button");
        counter_button.appendChild(ripple);

        let x = e.clientX - e.target.offsetLeft;
        let y = e.clientY - e.target.offsetTop;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        setTimeout(() => {
            ripple.remove();
        }, 300);
    };

    // This function retrieves localized dynamic text based on a given language code, and randomly replaces an element with one of the translations. 
    function refreshDynamicTexts() {
        let curLang = LANGUAGES[current_language];
        let localTexts = curLang.texts;
        Object.entries(localTexts).forEach(([textId, value]) => {
            if (value instanceof Array)
                if (document.getElementById(textId) != undefined)
                    document.getElementById(textId).innerHTML = randomChoice(value);
        });
    }

    // // This block dynamically displays different messages depending on which hostname the website is being loaded from.
    // if (location.hostname == "herta.ft2.ltd" || location.hostname == "hertakuru.netlify.app") {
    //     document.getElementById("access-via-tip-parent").innerHTML = "<p id='access-via-mirror'>Congratulations! You are using a mirror site, which should speed up access within China (Mainland) and some regions. Click here to <a href='https://duiqt.github.io/herta_kuru/'>visit the source site on GitHub Pages</a>.</p>";
    //     multiLangMutation();
    // } else {
    //     document.getElementById("access-via-tip-parent").innerHTML = "<p id='access-via-pages'>You're currently accessing via GitHub Pages. For users in China (Mainland) or some regions, click <a href='https://duiqt.github.io/herta_kuru/'>here to access the mirror on Netlify</a>.</p>";
    //     multiLangMutation();
    // }

    // This function fetches data stored in a JSON file and displays it in a dialog box.
    function showCredits() {
        fetch("credits.json").then(response => response.json()).then((data) => {
            var contributors = data.contributors;
            contributors = randomShuffle(contributors);
            var creditsHtmlContent = `<p>in no specific order</p>`;
            creditsHtmlContent += `<ul class="mdui-list">`;
            for (let i = 0; i < contributors.length; i++) {
                var current = contributors[i];
                let renderedName = current.username;
                if (current.name !== undefined) {
                    renderedName += " (" + current.name + ")";
                }
                creditsHtmlContent += `<li class="mdui-list-item mdui-ripple">
    <div class="mdui-list-item-avatar mdlist-ava-fix">
      <img src="${current.icon}"/>
    </div>
    <div class="mdui-list-item-content">
      <div class="mdui-list-item-title">${renderedName}</div>
      <div class="mdui-list-item-text mdui-list-item-one-line">
        <span class="mdui-text-color-theme-text">${current.thing}</span>
      </div>
    </div>
  </li>`;
            }
            creditsHtmlContent += `</ul>`;

            mdui.dialog({
                title: getLocalText("dialogs-credits-title"),
                content: creditsHtmlContent,
                buttons: [
                    {
                        text: getLocalText("dialogs-close")
                    }
                ],
                history: false
            });
        });
    }

    $("#show-credits-opt").on("click", e => showCredits())

    function showOptions() {
        mdui.dialog({
            title: 'Options',
            content: `<div class="mdui-typo" style="min-height: 350px;">
    <label id="options-txt-lang">Page Language</label>
    <select class="mdui-select" id="language-selector" mdui-select='{"position": "bottom"}'>
        <option value="cn">中文</option>
        <option value="ja">日本語</option>
    </select>
    <br />
    <label id="options-txt-vo-lang">Voice-Over Language</label>
    <select class="mdui-select" id="vo-language-selector" mdui-select='{"position": "bottom"}'>
        <option value="ja">日本語</option>
        <option value="cn">中文</option>
    </select>
</div>`,
            buttons: [
                {
                    text: getLocalText("dialogs-close")
                }
            ],
            history: false,
            onOpen: (inst) => {
                $("#vo-language-selector").val(current_vo_language);
                $("#language-selector").val(current_language);

                $("#language-selector").on("change", (ev) => {
                    current_language = ev.target.value;
                    localStorage.setItem("lang", ev.target.value);
                    multiLangMutation();
                });

                $("#vo-language-selector").on("change", (ev) => {
                    current_vo_language = ev.target.value;
                    localStorage.setItem("volang", ev.target.value);
                });

                multiLangMutation();
                mdui.mutation();
            }
        });
    }

    $("#show-options-opt").on("click", e => showOptions())
})(); 
