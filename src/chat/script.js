class ChatApp {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.apiKey = '';
        this.baseUrl = '';
        this.fileInput = document.getElementById('fileInput');
        this.uploadButton = document.getElementById('uploadButton');
        this.attachmentPreview = document.getElementById('attachmentPreview');
        this.currentUploadedFile = null;
        this.lastMessageId = null;
        this.conversationItems = document.getElementById('conversationItems');
        this.currentConversationId = '';
        this.firstMessageId = null;
        this.hasMore = true;
        this.isLoadingHistory = false;
        this.welcomePage = document.getElementById('welcomePage');
        this.chatContainer = document.getElementById('chatContainer');
        this.newChatButton = document.getElementById('newChatButton');
        this.toggleSidebarButton = document.getElementById('toggleSidebarButton');
        this.sidebar = document.querySelector('.sidebar');
        this.menuButton = document.getElementById('menuButton');
        this.overlay = document.getElementById('overlay');
        this.mainContent = document.querySelector('.main-content');
        this.isMobile = window.innerWidth <= 768;
        this.showSidebarButton = document.getElementById('showSidebarButton');
        this.welcomeUserInput = document.getElementById('welcomeUserInput');
        this.welcomeSendButton = document.getElementById('welcomeSendButton');
        this.welcomeUploadButton = document.getElementById('welcomeUploadButton');
        this.welcomeFileInput = document.getElementById('welcomeFileInput');
        this.welcomeAttachmentPreview = document.getElementById('welcomeAttachmentPreview');
        this.initialized = false;
        this.user = 'web-user';
        this.settingsButton = document.getElementById('settingsButton');
        this.settingsPage = document.getElementById('settingsPage');
        this.settingsForm = document.getElementById('settingsForm');
        this.currentTheme = localStorage.getItem('theme') || 'default';
        this.userName = localStorage.getItem('userName') || '未设置用户名';
        this.userAvatar = document.getElementById('userAvatar');
        this.userNameDisplay = document.getElementById('userName');
        this.toggleSettingsStates = null;
        this.toggleVoiceStates = null;
        this.micButton = document.getElementById('micButton');
        this.waveContainer = document.getElementById('waveContainer');
        this.statusText = document.getElementById('statusText');
        this.chatBody = document.getElementById('chatBody');
        this.isRecording = false;
        this.isBotReplying = false;
        this.voiceContainer = document.getElementById('voiceContainer');
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.currentAudioFile = null;
        this.audioStatus = false;
        this.appName = 'DifyWebUI';
        //弹窗
        this.confirmBtn = document.getElementById("confirmBtn");
        this.cancelBtn = document.getElementById("cancelBtn");
        this.tipPage = document.getElementById("tipPage");
        // 获取消息元素
        this.modalMessage = document.getElementById("modal-message");
        this.appCount = 1; // 用于跟踪应用数量
        this.addAppButton = document.getElementById('addAppButton');
        this.settingsContainer = document.getElementById('settingsContainer');
        this.closeSettingsButton = document.getElementById('closeSettings');
        this.settingsWrapper = document.getElementById('settingsWrapper');
        this.prevButton = document.getElementById('prevButton');
        this.nextButton = document.getElementById('nextButton');
        this.thinkMode = document.getElementById('think-mode');
        this.chatThinkMode = document.getElementById('chat-think-mode');
        this.currentSettingsIndex = 0;
        this.appNameForApiKey = new Map();
        this.settingsInitialized = false;
        // 记录对话回复里的taskId
        this.taskId = '';
        this.loadSettings();
        this.initSettingsHandlers();
        // 配置 marked
        this.initialize();
        this.init();
        this.loadWelcomeMessage();
        this.appSelectModal = document.getElementById('appSelectModal');

        // 修改应用标签相关元素的初始化
        this.appTags = document.querySelectorAll('.current-app-tag'); // 获取所有的应用标签
        this.appNameElements = document.querySelectorAll('.current-app-tag .app-name');
        
        // 为所有的切换按钮绑定事件
        document.querySelectorAll('.current-app-tag .switch-app').forEach(button => {
            button.addEventListener('click', () => {
                this.showAppSelector();
            });
        });

        // 为所有停止回复按钮绑定事件
        document.querySelectorAll('.current-app-tag .stop-responses').forEach(button => {
            button.addEventListener('click', () => {
                this.stopResponses();
            });
        });

        // 初始化时更新应用名称
        this.updateAppName();

        console.log("思考模式按钮元素:", this.thinkMode);
        console.log("聊天页思考模式按钮元素:", this.chatThinkMode);
    }

    // 修改导航按钮状态更新方法
    updateNavigationButtons() {
        const panels = Array.from(this.settingsWrapper.children);
        if (panels.length <= 1) {
            // 如果只有一个面板，隐藏导航按钮
            this.prevButton.style.display = 'none';
            this.nextButton.style.display = 'none';
            return;
        }

        // 始终显示按钮，因为现在支持循环切换
        this.prevButton.style.display = 'flex';
        this.nextButton.style.display = 'flex';
        this.prevButton.style.opacity = '1';
        this.nextButton.style.opacity = '1';
    }

    // 修改滚动方法
    scrollToPanel(panel) {
        const wrapper = this.settingsWrapper;
        const containerWidth = this.settingsContainer.offsetWidth;
        const panelWidth = panel.offsetWidth;
        
        // 计算需要移动的距离，使选中的面板居中
        const panelIndex = Array.from(wrapper.children).indexOf(panel);
        const offset = panelIndex * (panelWidth + 40); // 40是gap值
        const centerOffset = (containerWidth - panelWidth) / 2;
        
        // 使用transform来移动整个wrapper
        wrapper.style.transform = `translateX(${centerOffset - offset}px)`;

        // 更新面板状态
        const panels = Array.from(wrapper.children);
        panels.forEach(p => {
            p.classList.remove('active-panel');
            p.style.transform = 'scale(0.8)';
            p.style.opacity = '0.6';
        });
        
        // 添加动画效果
        requestAnimationFrame(() => {
            panel.classList.add('active-panel');
            panel.style.transform = 'scale(1)';
            panel.style.opacity = '1';
        });

        // 更新导航按钮状态
        setTimeout(() => {
            this.updateNavigationButtons();
        }, 300);
    }

    showInfoPage(message, confirmBtn = "确定", cancelBtn = "取消") {
        return new Promise((resolve) => {
            this.tipPage.style.display = "flex";
            this.modalMessage.innerText = message;

            // 根据按钮文本决定是否显示按钮
            const showButtons = confirmBtn !== "" || cancelBtn !== "";
            const buttonContainer = this.tipPage.querySelector('.modal-buttons');
            buttonContainer.style.display = showButtons ? 'flex' : 'none';

            if (showButtons) {
                this.confirmBtn.value = confirmBtn;
                this.cancelBtn.value = cancelBtn;

                // 根据是否提供按钮文本来显示/隐藏按钮
                this.confirmBtn.style.display = confirmBtn ? 'block' : 'none';
                this.cancelBtn.style.display = cancelBtn ? 'block' : 'none';
            }

            const confirmHandler = () => {
                this.tipPage.style.display = "none";
                this.confirmBtn.removeEventListener("click", confirmHandler);
                this.cancelBtn.removeEventListener("click", cancelHandler);
                resolve(true);
            };

            const cancelHandler = () => {
                this.tipPage.style.display = "none";
                this.confirmBtn.removeEventListener("click", confirmHandler);
                this.cancelBtn.removeEventListener("click", cancelHandler);
                resolve(false);
            };

            this.confirmBtn.addEventListener("click", confirmHandler);
            this.cancelBtn.addEventListener("click", cancelHandler);

            // 如果没有按钮文本，3秒后自动关闭
            if (!showButtons) {
                setTimeout(() => {
                    this.tipPage.style.display = "none";
                    resolve(true);
                }, 3000);
            }

            // 点击遮罩层关闭弹窗
            this.tipPage.addEventListener('click', (e) => {
                if (e.target === this.tipPage) {
                    this.tipPage.style.display = "none";
                    resolve(false);
                }
            });
        });
    }

    async startRecording() {
        try {
            this.waveContainer.style.display = 'flex';
            this.chatBody.classList.add('recording');
            this.statusText.textContent = '正在对话...';

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('浏览器不支持对话功能');
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            document.querySelectorAll('.wave').forEach((wave, index) => {
                wave.style.animationDuration = `${2 + Math.random() * 0.5}s`;
                wave.style.animationDelay = `${index * 0.8}s`;
            });
        } catch (error) {
            console.error('对话启动失败:', error);
            this.statusText.textContent = '对话失败: ' + error.message;
            this.isRecording = false;
        }
    }

    async stopRecording() {
        try {
            this.waveContainer.style.display = 'none';
            this.chatBody.classList.remove('recording');
            this.statusText.textContent = '正在处理...';
            return new Promise((resolve) => {
                this.mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    this.audioChunks = [];
                    const fileName = `recording-${new Date().getTime()}.wav`;
                    this.currentAudioFile = new File([audioBlob], fileName, { type: 'audio/wav' });
                    await this.uploadAudioFile(this.currentAudioFile);
                    this.statusText.textContent = '等待回复';
                    setTimeout(() => {
                        this.statusText.textContent = '点击麦克风开始说话';
                    }, 2000);
                    resolve();
                };

                this.mediaRecorder.stop();
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            });
        } catch (error) {
            console.error('停止对话失败:', error);
            this.statusText.textContent = '对话失败: ' + error.message;
        }
    }

    async uploadAudioFile(file) {
        // 创建FormData对象
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user', this.user);
        try {
            const response = await fetch(`${this.baseUrl}/files/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: formData
            });

            const result = await response.json();
            if (result.id) {
                this.currentUploadedFile = {
                    id: result.id,
                    name: result.name
                };
                this.showPreview(file);
            }
        } catch (error) {
            console.error('上传文件失败:', error);
            this.showInfoPage("文件上传失败，请重试!")
                .then(userConfirmed => {
                    if (userConfirmed) {
                        console.log("用户确认了操作");
                    } else {
                        console.log("用户取消了操作");
                    }
                })
        }
    }

    simulateBotReply() {
        this.isBotReplying = true;
        this.waveContainer.style.display = 'flex';
        this.chatBody.classList.add('bot-replying');
        this.statusText.innerHTML = '正在回复中<div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    }

    updateWaveHeights() {
        if (isRecording) {
            document.querySelectorAll('.wave').forEach(wave => {
                // 每次变化幅度更小，使动画更平滑
                const height = 25 + Math.random() * 30;  // 调整波形高度范围
                wave.style.height = `${height}px`;
            });
        }
        setTimeout(() => requestAnimationFrame(updateWaveHeights), 50);
    }


    initialize() {
        this.configureMarked();
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    document.querySelectorAll('.code-block:not(.initialized)').forEach(block => {
                        const toggleBtn = block.querySelector('.toggle-button');
                        const copyBtn = block.querySelector('.copy-button');
                        if (toggleBtn) {
                            toggleBtn.addEventListener('click', this.toggleCode);
                        }
                        if (copyBtn) {
                            copyBtn.addEventListener('click', this.copyCode);
                        }
                        block.classList.add('initialized');
                    });
                }
            });
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

    }

    toggleVoiceInterface() {
        const show = this.voiceContainer.style.display === 'none';
        if (show) {
            console.log('voice interface');
            this.toggleVoiceStates = {
                welcomePage: this.welcomePage.style.display,
                chatContainer: this.chatContainer.style.display,
            }
            this.voiceContainer.style.display = 'flex';
            this.welcomePage.style.display = 'none';
            this.chatContainer.style.display = 'flex';
            this.audioStatus = true;
            this.welcomePage.style.display = 'none';
        } else {
            console.log('Hiding voice interface');
            this.voiceContainer.style.display = 'none';
            this.welcomePage.style.display = this.toggleVoiceStates.welcomePage;
            this.chatContainer.style.display = this.toggleVoiceStates.chatContainer;
            this.audioStatus = false;
        }
    }

    configureMarked() {
        // 配置常量定义
        const MARKED_DEFAULTS = {
            breaks: true,
            gfm: true,
            headerIds: false,
            mangle: false,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false,
            xhtml: false
        };

        // 高亮处理函数
        const highlightCode = (code, lang = 'plaintext') => {
            try {
                const validLang = hljs.getLanguage(lang) ? lang : null;
                return validLang
                    ? hljs.highlight(code, { language: validLang, ignoreIllegals: true }).value
                    : hljs.highlightAuto(code).value;
            } catch (error) {
                console.warn('Code highlighting failed:', error);
                return hljs.highlightAuto(code).value || code;
            }
        };

        try {
            // 配置 marked 基础选项
            marked.setOptions(MARKED_DEFAULTS);

            // 自定义渲染器
            const renderer = new marked.Renderer();

            // 保留原始代码块处理逻辑
            renderer.code = (code, lang) => {
                const highlighted = highlightCode(code, lang);
                const numbered = this.addLineNumbers(highlighted);
                return this.createCollapsibleCode(numbered, lang);
            };

            const preprocess = (text) => {
                return text.replace(/<think>([\s\S]*?)<\/think>/g, (match, content) => {
                    if (!content.trim()) return '';
                    const tableContent = content.trim();

                    return `
                            <details style="border: 1px solid #ddd; padding: 10px; border-radius: 8px; background-color: #f9f9f9; margin-bottom: 10px;">
                                <summary style="font-size: 1.2em; font-weight: bold; color: #333; cursor: pointer;">
                                    🧠 思考过程
                                </summary>
                                <div style="color: #555; font-style: italic; padding: 10px; background-color: #f4f4f4; border-radius: 5px; line-height: 1.5;">
                                    ${tableContent}
                                </div>
                            </details>
                            <div style="border: 1px solid #ddd; padding: 10px; border-radius: 8px; background-color: #f9f9f9; margin-bottom: 10px;">
                            <span style="font-size: 1.2em; font-weight: bold; color: #333; cursor: pointer;">
                                📌 正式回答
                            </span>
                            <div style="color: #000; padding: 10px; background-color: #f4f4f4; border-radius: 5px; line-height: 1.5;">`.trim();
                });
            };
            // 重写 marked 的解析方法
            const originalParse = marked.parse;
            marked.parse = (text, options) => {
                const preprocessed = preprocess(text);
                return originalParse.call(marked, preprocessed, {
                    ...options,
                    // 确保不会重复处理已转换的内容
                    sanitize: false,
                    silent: true
                });
            };

            // 应用配置
            marked.use({ renderer });

        } catch (error) {
            console.error('Marked configuration failed:', error);
            marked.setOptions({
                breaks: true,
                gfm: true,
                sanitize: true
            });
        }
    }
    addLineNumbers(code) {
        try {
            const lines = code.split('\n');
            return lines.map((line, index) =>
                `<div class="line">
                    <span class="line-number">${index + 1}</span>
                    <span class="line-content">${line}</span>
                 </div>`
            ).join('');
        } catch (error) {
            console.error('Error adding line numbers:', error);
            return code;
        }
    }

    createCollapsibleCode(code, language) {
        try {
            // 创建代码块的 HTML 结构
            const template = ` 
                <div class="code-block collapsible">
                    <div class="code-header">
                        <span class="language-badge">${language || 'plaintext'}</span>
                        <div class="code-actions">
                            <button class="toggle-button">
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <button class="copy-button">
                                <i class="fas fa-copy"></i> 复制
                            </button>
                        </div>
                    </div>
                    <div class="code-content">
                        <pre><code class="language-${language || 'plaintext'}">${code}</code></pre>
                    </div>
                </div>`;

            // 创建一个函数来初始化事件监听器
            const initializeCodeBlock = () => {
                // 查找所有没有初始化的代码块
                document.querySelectorAll('.code-block:not(.initialized)').forEach(block => {
                    // 添加事件监听器
                    const toggleBtn = block.querySelector('.toggle-button');
                    const copyBtn = block.querySelector('.copy-button');
                    const viewBtn = block.querySelector('.view-button');
                    if (toggleBtn) {
                        toggleBtn.addEventListener('click', this.toggleCode);
                    }
                    if (copyBtn) {
                        copyBtn.addEventListener('click', this.copyCode);
                    }
                    // 标记为已初始化
                    block.classList.add('initialized');
                });
            };
            // 添加到 DOM 后初始化事件监听器
            setTimeout(initializeCodeBlock, 0);
            return template;
        } catch (error) {
            console.error('Error creating collapsible code:', error);
            return code;
        }
    }
    findAncestor(element, selector) {
        while (element && element.parentElement) {
            element = element.parentElement;
            if (element.matches(selector)) return element;
        }
        return null;
    }

    toggleCode(event) {
        try {
            console.log('Toggle button clicked');
            const button = event.currentTarget;
            const codeBlock = button.closest ? button.closest('.code-block') :
                this.findAncestor(button, '.code-block');

            if (!codeBlock) {
                console.error('Code block not found');
                return;
            }
            const content = codeBlock.querySelector('.code-content');
            if (!content) {
                console.error('Code content not found');
                return;
            }
            const isVisible = content.style.display !== 'none';
            content.style.display = isVisible ? 'none' : 'block';

            const icon = button.querySelector('i');
            if (icon) {
                icon.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
            }
        } catch (error) {
            console.error('Error in toggleCode:', error);
        }
    }

    findParentWithClass(element, className) {
        let current = element;
        while (current && current !== document) {
            if (current.classList && current.classList.contains(className)) {
                return current;
            }
            current = current.parentNode;
        }
        return null;
    }

    copyCode(event) {
        try {
            const button = event.currentTarget;
            const codeBlock = button.closest('.code-block');
            if (!codeBlock) return;

            // 获取所有代码内容元素（排除行号）
            const codeLines = codeBlock.querySelectorAll('.line-content');
            if (!codeLines.length) return;
            // 将所有代码行内容合并，并去除可能的首尾空格
            const codeText = Array.from(codeLines)
                .map(line => line.textContent)
                .join('\n')
                .trim();
            navigator.clipboard.writeText(codeText).then(() => {
                button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                button.innerHTML = '<i class="fas fa-times"></i> Error!';
            });
        } catch (error) {
            console.error('Error in copyCode:', error);
        }
    }

    async init() {
        // 先绑定事件监听器
        this.bindEventListeners();
        // 立即加载历史对话
        await this.loadConversations();
        // 标记初始化完成
        this.initialized = true;
        //检查apikey
        if (!this.apiKey) {
            const apiState = await this.showInfoPage("请输入apikey", "确实", "取消").then(result => {
                if (apiState) {
                    this.toggleSettingsPage();
                } else {
                    return;
                }
            });
        }
    }

    bindEventListeners() {
        // 将原来init中的事件绑定移到这个新方法中
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.uploadButton.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        this.userInput.addEventListener('input', () => this.adjustTextareaHeight(this.userInput));
        this.welcomeUserInput.addEventListener('input', () => this.adjustTextareaHeight(this.welcomeUserInput));

        // 添加新对话按钮事件
        this.newChatButton.addEventListener('click', () => this.showAppSelector());

        // 添加侧边栏切换按钮事件
        this.toggleSidebarButton.addEventListener('click', () => this.toggleSidebar());

        // 添加示例建议点击事件
        document.querySelectorAll('.welcome-suggestion-items button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.startNewChat(e.target.textContent.replace(/["]/g, ''));
            });
        });

        // 添加移动端侧边栏控制
        this.menuButton.addEventListener('click', () => this.toggleMobileSidebar());
        this.overlay.addEventListener('click', () => this.toggleMobileSidebar());

        // 添加窗口大小变化监听
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            this.updateSidebarState();
        });

        // 在移动端点击对话项后自动隐藏侧边栏
        this.conversationItems.addEventListener('click', () => {
            if (this.isMobile) {
                this.toggleMobileSidebar();
            }
        });

        // 添加显示侧边栏按钮事件
        this.showSidebarButton.addEventListener('click', () => this.showSidebar());

        // 欢迎页面输入框事件
        this.welcomeSendButton.addEventListener('click', () => this.sendWelcomeMessage());
        this.welcomeUserInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendWelcomeMessage();
            }
        });
        this.welcomeUploadButton.addEventListener('click', () => this.welcomeFileInput.click());
        this.welcomeFileInput.addEventListener('change', (e) => this.handleWelcomeFileSelect(e));

        const micButtons = document.getElementsByClassName('mic-p-button');
        Array.from(micButtons).forEach(button => {
            button.addEventListener('click', () => {
                this.toggleVoiceInterface();
            });
        });


        this.micButton.addEventListener('click', async () => {
            if (this.isBotReplying) return;
            if (!this.isRecording) {
                await this.startRecording();

            } else {
                await this.stopRecording();
                this.simulateBotReply();
                this.isRecording = false;
            }
        });
        this.closeSettingsButton.addEventListener('click', () => {
            this.toggleSettingsPage();
        });

        // 添加导航按钮点击事件
        this.prevButton.addEventListener('click', () => {
            this.currentSettingsIndex = Math.max(0, this.currentSettingsIndex - 1);
            this.scrollToPanel(this.settingsWrapper.children[this.currentSettingsIndex]);
        });

        this.nextButton.addEventListener('click', () => {
            this.currentSettingsIndex = Math.min(this.settingsWrapper.children.length - 1, this.currentSettingsIndex + 1);
            this.scrollToPanel(this.settingsWrapper.children[this.currentSettingsIndex]);
        });

        // 确保元素存在
        if(this.thinkMode) {
            console.log("找到欢迎页思考模式按钮");
            this.thinkMode.addEventListener('click', (e) => {
                console.log("点击欢迎页思考模式按钮");
                e.preventDefault();
                e.stopPropagation();
                console.log("准备跳转到:", '../agent/index.html');
                window.location.href = '../agent/index.html';
            });
        } else {
            console.error("找不到欢迎页思考模式按钮元素");
        }
        
        // 聊天界面思考模式按钮
        if(this.chatThinkMode) {
            console.log("找到聊天页思考模式按钮");
            this.chatThinkMode.addEventListener('click', (e) => {
                console.log("点击聊天页思考模式按钮");
                e.preventDefault();
                e.stopPropagation();
                console.log("准备跳转到:", '../agent/index.html');
                window.location.href = '../agent/index.html';
            });
        } else {
            console.error("找不到聊天页思考模式按钮元素");
        }
    }

    adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto'; // 重置高度
        textarea.style.height = `${textarea.scrollHeight}px`; // 根据内容调整高度
    }

    appendMessage(content, isUser = false, parent = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        messageDiv.classList.add('show');

        // 添加头像
        const avatar = document.createElement('img');
        avatar.className = 'avatar';
        avatar.src = isUser
            ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${this.userName}`
            : '../../rebot.svg';
        messageDiv.appendChild(avatar);

        // 创建包装器
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'message-content-wrapper';

        // 创建消息内容
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (isUser) {
            messageContent.innerHTML = marked.parse(content);
            messageContent.classList.add('show-content');
        } else {
            // 机器人消息初始化时只添加基本结构
            messageContent.innerHTML = '<div class="content-container"></div>';
        }

        contentWrapper.appendChild(messageContent);
        messageDiv.appendChild(contentWrapper);

        if (parent) {
            parent.appendChild(messageDiv);
        } else {
            this.chatMessages.appendChild(messageDiv);
            this.scrollToBottom();
        }

        return messageDiv;
    }

    showContent(messageContent) {
        const spans = messageContent.querySelectorAll('p span');
        let delay = 0;
        const delayIncrement = 10; // 减少延迟增量

        spans.forEach((span) => {
            setTimeout(() => {
                span.style.opacity = 1;
            }, delay);
            delay += delayIncrement;
        });

        // 立即显示消息内容
        messageContent.classList.add('show-content');
        const messageActions = messageContent.querySelector('.message-actions');
        if (messageActions) {
            messageActions.style.opacity = '1';
        }
    }

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('user', this.user);

            const response = await fetch(`${this.baseUrl}/files/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: formData
            });
            const result = await response.json();
            if (result.id) {
                this.currentUploadedFile = {
                    id: result.id,
                    name: result.name
                };
                this.showPreview(file);
            }
        } catch (error) {
            console.error('上传文件失败:', error);
            this.showInfoPage("文件上传失败，请重试!")
                .then(userConfirmed => {
                    if (userConfirmed) {
                        console.log("用户确认了操作");
                    } else {
                        console.log("用户取消了操作");
                    }
                })
        }
    }

    showPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.attachmentPreview.innerHTML = `
                <div class="upload-preview show">
                    <img src="${e.target.result}" alt="预览">
                    <div class="upload-progress">
                        <div class="upload-progress-bar" style="width: 0%"></div>
                    </div>
                    <button class="upload-delete" onclick="chatApp.removeAttachment()">×</button>
                </div>
            `;
            this.attachmentPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    removeAttachment() {
        this.attachmentPreview.innerHTML = '';
        this.attachmentPreview.style.display = 'none'; // 隐藏预览
        this.currentUploadedFile = null;
        this.fileInput.value = '';
    }

    async loadSuggestions(messageDiv) {
        if (!this.lastMessageId) return;

        try {
            const response = await fetch(
                `${this.baseUrl}/messages/${this.lastMessageId}/suggested?user=${this.user}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();
            if (data.result === 'success' && data.data) {
                const suggestionsContainer = messageDiv.querySelector('.suggestions-container');
                suggestionsContainer.innerHTML = ''; // 清除现有建议

                data.data.forEach(suggestion => {
                    const btn = document.createElement('button');
                    btn.className = 'suggestion-item';
                    btn.textContent = suggestion;
                    btn.addEventListener('click', () => {
                        this.userInput.value = suggestion;
                        this.sendMessage();
                    });
                    suggestionsContainer.appendChild(btn);
                });
                // 滚动到建议列表可见
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } catch (error) {
            console.error('获取建议失败:', error);
        }
    }
    clearAllSuggestions() {
        const allSuggestions = document.querySelectorAll('.suggestions-container');
        allSuggestions.forEach(container => {
            container.innerHTML = '';
        });
    }

    scrollToBottom() {
        const scrollOptions = {
            top: this.chatMessages.scrollHeight,
            behavior: 'smooth'
        };
        this.chatMessages.scrollTo(scrollOptions);
    }

    async sendMessage() {
        // 隐藏欢迎页面，显示聊天界面
        this.welcomePage.style.display = 'none';
        this.chatContainer.style.display = 'flex';
        if (!this.initialized) return;
        // 清除所有现有建议
        this.clearAllSuggestions();
        let message = this.userInput.value.trim();
        if (!message && !this.currentUploadedFile) return;
        // 显示用户消息
        this.appendMessage(message, true);
        this.userInput.value = '';
        this.userInput.style.height = 'auto'; // 发送消息后重置高度
        this.welcomeUserInput.style.height = 'auto'; // 发送消息后重置高度
        if (this.audioStatus) {
            message = `你好GPT，我正在进行语音对话。请以友善的态度简要回答我的问题，并保持回答精炼。
                        以下是我的问题：${message}`;
        }
        const sendData = {
            query: message,
            response_mode: 'streaming',
            conversation_id: this.currentConversationId,
            user: this.user,
            inputs: {}
        };
        // 如果有附件，添加到发送数据中
        if (this.currentUploadedFile) {
            sendData.files = [{
                type: 'image',
                transfer_method: 'local_file',
                upload_file_id: this.currentUploadedFile.id
            }];
            this.removeAttachment(); // 发送消息后移除附件预览
        }
        // 创建机器人响应的消息容器
        const botMessageDiv = this.appendMessage('', false);
        const messageContent = botMessageDiv.querySelector('.message-content');
        let fullResponse = '';
        let isFirstMessage = true;

        try {
            const response = await fetch(`${this.baseUrl}/chat-messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sendData)
            });
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            // 标记这是否是新对话的第一条消息
            const isNewConversation = !this.currentConversationId;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            // 当前回复的taskId
                            if (!this.taskId && data.task_id) {
                                this.taskId = data.task_id;
                                // 显示停止回复按钮
                                document.querySelectorAll('.stop-responses').forEach(button => {
                                    button.style.display = 'inline-block';
                                });
                            }
                            switch (data.event) {
                                case 'message':
                                    if (isFirstMessage) {
                                        messageContent.classList.add('typing');
                                        isFirstMessage = false;
                                    }
                                    fullResponse += data.answer;
                                    // 使用 requestAnimationFrame 来平滑更新内容
                                    requestAnimationFrame(() => {
                                        messageContent.innerHTML = marked.parse(fullResponse);
                                    });
                                    this.lastMessageId = data.message_id;
                                    this.currentConversationId = data.conversation_id;
                                    // 使用平滑滚动
                                    this.chatMessages.scrollTo({
                                        top: this.chatMessages.scrollHeight,
                                        behavior: 'smooth'
                                    });
                                    break;
                                case 'agent_thought':
                                    if (data.thought) {
                                        thought = data.thought;
                                    }
                                    if (data.tool && data.tool_input) {
                                        const toolContent = `\n\n**Using ${data.tool}:**\n\`\`\`json\n${data.tool_input}\n\`\`\`\n\n`;
                                        fullResponse += toolContent;
                                    }
                                    if (data.observation) {
                                        fullResponse += `\n\n**Observation:** ${data.observation}\n\n`;
                                    }
                                    if (data.message_files) {
                                        messageFiles = messageFiles.concat(data.message_files);
                                    }
                                    break;
                                case 'message_file':
                                    if (data.type === 'image') {
                                        const imageHtml = `\n\n![Generated Image](${data.url})\n\n`;
                                        fullResponse += imageHtml;
                                    }
                                    break;
                                case 'tts_message':
                                    if (data.audio) {
                                        // 处理文本转语音
                                        this.playAudio(data.audio);
                                    }
                                    break;
                                case 'message_end':
                                    messageContent.classList.remove('typing');
                                    this.taskId = '';
                                    // 因此停止回复按钮
                                    document.querySelectorAll('.stop-responses').forEach(button => {
                                        button.style.display = 'none';
                                    });
                                    break;
                            }
                        } catch (e) {
                            console.error('解析响应数据失败:', e);
                            continue;
                        }
                    }
                }
            }

            // 在消息接收完成后，如果是新会话的第一条消息，自动重命名会话
            if (isNewConversation && this.currentConversationId) {
                // 自动生成会话名称
                await this.renameConversation(this.currentConversationId, '', true);
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            messageContent.textContent = '抱歉，发生了错误。请稍后重试。';
        }
        if (this.audioStatus) {
            this.textToAudio(this.lastMessageId);
        }
        this.removeAttachment(); // 发送消息后移除附件预览
        await this.loadConversations();
        // 在消息发送时隐藏欢迎页面
        this.welcomePage.style.display = 'none';
        this.chatContainer.style.display = 'flex';
    }

    /**
     * 停止当前聊天会话中进行中的AI响应。
     * 
     * 该方法：
     * 1. 向服务器发送POST请求以停止消息生成
     * 2. 在请求中包含用户信息和认证信息
     * 3. 无论请求结果如何，都会隐藏UI中所有停止回复按钮
     * 
     * @async
     * @returns {Promise<void>}
     * @throws {Error} 将错误记录到控制台，但不会传播它们
     */
    async stopResponses() {
        try {
            fetch(`${this.baseUrl}/chat-messages/${this.taskId}/stop`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user: this.user })
            });
        } catch (error) {
            console.error('停止响应失败:', error);
        } finally {
            // 隐藏停止回复按钮
            document.querySelectorAll('.stop-responses').forEach(button => {
                button.style.display = 'none';
            });
        }
    }

    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    async getAppInfo(apiKey) {
        try {
            if (!apiKey) apiKey = this.apiKey;
            
            // 如果已经缓存了应用信息，直接返回
            if (this.appNameForApiKey.has(apiKey)) {
                return {
                    name: this.appNameForApiKey.get(apiKey)
                };
            }

            // 修改请求路径为正确的API endpoint
            const response = await fetch(`${this.baseUrl}/info?user=${this.user}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch app info');
            }

            const data = await response.json();
            
            // 缓存应用信息
            if (data && data.name) {
                this.appNameForApiKey.set(apiKey, data.name);
            } else {
                // 如果没有获取到名称，设置一个默认值
                this.appNameForApiKey.set(apiKey, "未命名应用");
            }

            return data;
        } catch (error) {
            console.error('Error fetching app info:', error);
            // 发生错误时也设置一个默认值
            this.appNameForApiKey.set(apiKey, "未命名应用");
            return {
                name: "未命名应用"
            };
        }
    }

    /**
     * 重命名对话。
     *
     * @param {string} conversationId - 要重命名的对话ID。
     * @param {string} [newName] - 对话的新名称。若 auto_generate 为 true 时，该参数可不传。
     * @param {boolean} [auto_generate] - 是否自动生成名称的标志。
     * @returns {Promise<string|undefined>} 如果成功，返回对话的新名称。
     * @throws 如果重命名过程失败，将抛出错误。
     */
    async renameConversation(conversationId, newName, auto_generate) {
        try {
            const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/name`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: this.user,
                    name: newName,
                    auto_generate: auto_generate
                })
            }
            );
            const data = await response.json();
            if (data.name) {
                console.log('会话重命名成功');
                return data.name;
            } else {
                console.log('会话重命名失败');
            }
        } catch (error) {
            console.error('重命名会话失败:', error);
        }
    }

    async loadConversations() {
        try {
            // 显示加载状态
            this.conversationItems.innerHTML = '<div class="loading">加载中...</div>';
            const response = await fetch(
                `${this.baseUrl}/conversations?user=${this.user}&limit=20`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();
            // 清除加载状态
            this.conversationItems.innerHTML = '';
            if (data.data && data.data.length > 0) {
                this.renderConversations(data.data);
                this.hasMore = data.has_more;
            } else {
                // 没有历史对话时显示提示
                this.conversationItems.innerHTML = '<div class="no-conversations">暂无历史对话</div>';
            }
        } catch (error) {
            console.error('加载对话列表失败:', error);
            this.conversationItems.innerHTML = '<div class="error">加载失败，请刷新重试</div>';
        }
    }

    renderConversations(messages) {
        messages.sort((a, b) => b.created_at - a.created_at);
        this.conversationItems.innerHTML = ''; // 清除现有列表
        messages.forEach(message => {
            const item = document.createElement('div');
            item.className = 'conversation-item';
            item.dataset.conversationId = message.id;
            const time = new Date(message.created_at * 1000).toLocaleString();
            item.innerHTML = `
                <div class="conversation-content">
                    <div>${message.name}</div>
                    <div class="time">${time}</div>
                </div>
                <button class="delete-btn" title="删除会话">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            // 给删除按钮添加事件监听
            const deleteBtn = item.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                this.deleteConversation(message.id);
            });
            // 给会话项添加点击事件
            item.querySelector('.conversation-content').addEventListener('click', () => {
                this.switchConversation(message.id);
            });
            if (message.id === this.currentConversationId) {
                item.classList.add('active');
            }
            this.conversationItems.appendChild(item);
        });
    }

    async deleteConversation(conversationId) {
        if (!confirm('确定要删除这个会话吗？')) return;
        try {
            const response = await fetch(
                `${this.baseUrl}/conversations/${conversationId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user: this.user })
                }
            );
            const data = await response.json();
            if (data.result === 'success') {
                // 如果删除的是当前会话，重置状态并显示欢迎页面
                if (conversationId === this.currentConversationId) {
                    this.currentConversationId = '';
                    this.firstMessageId = null;
                    this.lastMessageId = null;
                    this.chatMessages.innerHTML = '';
                    this.welcomePage.style.display = 'flex';
                    this.chatContainer.style.display = 'none';
                }
                // 重新加载会话列表
                await this.loadConversations();
            }
        } catch (error) {
            console.error('删除会话失败:', error);
            const userConfirmed = await this.showInfoPage('删除会话失败，请重试')

        }
    }

    async audioToText(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('user', this.user);
            const response = await fetch(`${this.baseUrl}/audio-to-text`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: formData
            });
            const result = await response.json();
            if (result.result === 'success') {
                this.userInput.value = result.text;
                this.sendMessage();
            } else {
                throw new Error('Audio to text conversion failed');
            }
        } catch (error) {
            console.error('音频转文字失败:', error);
            throw error;
        }
    }

    async textToAudio(messageId) {
        try {
            const requestBody = {
                user: this.user,
                message_id: messageId
            };
            const response = await fetch(
                `${this.baseUrl}/text-to-audio`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            // 创建 MediaSource 实例
            const mediaSource = new MediaSource();
            const audio = new Audio();
            audio.src = URL.createObjectURL(mediaSource);

            mediaSource.addEventListener('sourceopen', async () => {
                // 创建 SourceBuffer
                const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
                const reader = response.body.getReader();
                // 读取流数据
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    // 等待前一个数据添加完成
                    if (sourceBuffer.updating) {
                        await new Promise(resolve => {
                            sourceBuffer.addEventListener('updateend', resolve, { once: true });
                        });
                    }
                    // 添加新的音频数据
                    sourceBuffer.appendBuffer(value);
                }
                mediaSource.endOfStream();
            });
            // 播放音频
            await audio.play();
            //回复完成
            this.waveContainer.style.display = 'none';
            this.chatBody.classList.remove('bot-replying');
            this.statusText.textContent = '点击麦克风开始对话';
            this.isBotReplying = false;
        } catch (error) {
            console.error('文字转语音失败:', error);
        }
    }

    playAudio(audioData) {
        try {
            // 如果是ArrayBuffer直接创建blob
            if (audioData instanceof ArrayBuffer) {
                const blob = new Blob([audioData], { type: 'audio/mpeg' });
                const audio = new Audio(URL.createObjectURL(blob));
                return audio.play();
            }

            // 保留base64处理逻辑作为备用
            const base64String = this.arrayBufferToBase64(audioData);
            const audio = new Audio();
            audio.src = `data:audio/mpeg;base64,${base64String}`;
            audio.addEventListener('error', (e) => {
                console.error('音频加载失败:', e.target.error);
            });
            return audio.play().catch((error) => {
                console.error('播放音频失败:', error);
                audio.src = `data:audio/wav;base64,${base64String}`;
                return audio.play();
            });
        } catch (error) {
            console.error('音频初始化失败:', error);
        }
    }

    async switchConversation(conversationId) {
        if (conversationId === this.currentConversationId) return;

        this.currentConversationId = conversationId;
        this.firstMessageId = null;
        this.hasMore = true;
        this.chatMessages.innerHTML = '';
        await this.loadMoreMessages();

        // 更新选中状态
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.conversationId === conversationId) {
                item.classList.add('active');
            }
        });

        // 确保切换到聊天界面
        this.welcomePage.style.display = 'none';
        this.chatContainer.style.display = 'flex';
    }

    async loadWelcomeMessage() {
        await this.getAppInfo();
        const welcomeMessage = document.getElementsByTagName('h1')[0];
        welcomeMessage.innerText = '';
        this.typeWriter(`Hi, ${this.userName}, I'm ${this.appNameForApiKey.get(this.apiKey)}. How can I help you?`, welcomeMessage);
    }

    async loadMoreMessages() {
        if (this.isLoadingHistory) return;
        this.isLoadingHistory = true;

        try {
            const url = new URL(`${this.baseUrl}/messages`);
            const params = {
                user: this.user,
                conversation_id: this.currentConversationId,
                limit: '100'
            };
            if (this.firstMessageId) {
                params.first_id = this.firstMessageId;
            }
            url.search = new URLSearchParams(params).toString();

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            this.hasMore = data.has_more;

            if (data.data.length > 0) {
                this.firstMessageId = data.data[0].id;
                this.renderHistoryMessages(data.data);
                this.scrollToBottom();
            }
        } catch (error) {
            console.error('加载历史消息失败:', error);
        } finally {
            this.isLoadingHistory = false;
        }
    }

    renderHistoryMessages(messages) {
        const fragment = document.createDocumentFragment();
        messages.forEach(message => {
            // 创建AI响应消息并使用 Markdown 渲染
            if (message.answer) {
                const userMessageDiv = this.appendMessage('', true);
                userMessageDiv.querySelector('.message-content').innerHTML = marked.parse(message.query);
                const botMessageDiv = this.appendMessage('', false);
                botMessageDiv.querySelector('.message-content').innerHTML = marked.parse(message.answer);
            }
        });

        // 在现有消息前插入历史消息
        this.chatMessages.insertBefore(fragment, this.chatMessages.firstChild);
    }

    async startNewChat(initialMessage = '') {
        this.currentConversationId = '';
        this.firstMessageId = null;
        this.lastMessageId = null;
        this.chatMessages.innerHTML = '';

        this.welcomePage.style.display = 'flex';
        this.chatContainer.style.display = 'none';
        await this.loadWelcomeMessage();

        if (initialMessage) {
            this.userInput.value = initialMessage;
            await this.sendMessage();
            this.loadConversations();
        } else {
            this.loadConversations();
        }
    }

    toggleMobileSidebar() {
        this.sidebar.classList.toggle('mobile-visible');
        this.overlay.classList.toggle('visible');
    }

    toggleSidebar() {
        if (this.isMobile) {
            this.toggleMobileSidebar();
        } else {
            this.sidebar.classList.toggle('collapsed');
            this.mainContent.classList.toggle('sidebar-collapsed');
            this.showSidebarButton.classList.toggle('visible');
        }
    }

    showSidebar() {
        this.sidebar.classList.remove('collapsed');
        this.mainContent.classList.remove('sidebar-collapsed');
        this.showSidebarButton.classList.remove('visible');
    }

    updateSidebarState() {
        if (!this.isMobile) {
            this.sidebar.classList.remove('mobile-visible');
            this.overlay.classList.remove('visible');
        }
    }

    sendWelcomeMessage() {
        const message = this.welcomeUserInput.value.trim();
        if (!message && !this.currentUploadedFile) return;
        this.welcomeUserInput.value = '';
        this.startNewChat();
        this.userInput.value = message;
        this.sendMessage();
    }

    handleWelcomeFileSelect(event) {
        // 复用现有的文件处理逻辑
        this.handleFileSelect(event);
        // 更新预览容器
        this.attachmentPreview = this.welcomeAttachmentPreview;
    }

    loadSettings() {
        // 从 localStorage 加载配置，如果没有则使用默认值
        this.apiKey = localStorage.getItem('apiKey') || 'dont_update_me';
        this.baseUrl = localStorage.getItem('baseUrl') || 'https://api.dify.ai';
        this.user = localStorage.getItem('userId') || '';
        document.getElementById('userNameInput').value = this.userName;
        this.applyTheme(this.currentTheme);
        this.updateUserInfo();

        // 更新主应用表单值
        document.getElementById('apiKey').value = this.apiKey;
        document.getElementById('baseUrl').value = this.baseUrl;
        document.getElementById('userId').value = this.user;

        // 确保主题选择器正确显示当前主题
        const savedTheme = localStorage.getItem('theme') || 'default';
        this.applyTheme(savedTheme);

        // 只在第一次加载时初始化子应用面板
        if (!this.settingsInitialized) {
            // 获取所有存储的子应用数量
            let maxAppIndex = 1;
            for (let i = 2; ; i++) { // 移除应用数量限制条件
                const apiKey = localStorage.getItem(`apiKey_${i}`);
                const baseUrl = localStorage.getItem(`baseUrl_${i}`);
                if (!apiKey && !baseUrl) {
                    break;
                }
                maxAppIndex = i;
            }

            // 更新应用计数
            this.appCount = maxAppIndex;
            localStorage.setItem(`appCount`, this.appCount);

            // 恢复所有子应用设置面板
            for (let i = 2; i <= this.appCount; i++) {
                const apiKey = localStorage.getItem(`apiKey_${i}`);
                const baseUrl = localStorage.getItem(`baseUrl_${i}`);

                if (apiKey || baseUrl) {
                    const newSettingsContent = document.createElement('div');
                    newSettingsContent.className = 'settings-content';
                    if (i % 2 === 0) {
                        newSettingsContent.classList.add('right-app');
                        this.settingsWrapper.appendChild(newSettingsContent);
                    } else {
                        newSettingsContent.classList.add('left-app');
                        this.settingsWrapper.insertBefore(newSettingsContent, this.settingsWrapper.firstChild);
                    }

                    // 获取应用名称
                    this.getAppInfo(apiKey).then(() => {
                        const appName = this.appNameForApiKey.get(apiKey) || `应用 ${i}`;
                        newSettingsContent.innerHTML = `
                            <div class="app-title">
                                <h3>${appName}</h3>
                                <button class="remove-app" onclick="chatApp.removeAppSettings(this)">删除</button>
                            </div>
                            <form class="settings-form">
                                <div class="form-group">
                                    <label for="apiKey${i}">API Key</label>
                                    <input type="text" id="apiKey${i}" name="apiKey" value="${apiKey || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label for="baseUrl${i}">Base URL</label>
                                    <input type="url" id="baseUrl${i}" name="baseUrl" value="${baseUrl || ''}" required>
                                </div>
                                <button type="submit" class="save-button">保存设置</button>
                            </form>
                        `;

                        // 为新表单添加提交事件处理
                        const form = newSettingsContent.querySelector('form');
                        form.addEventListener('submit', (e) => {
                            e.preventDefault();
                            this.saveAppSettings(form, i);
                        });

                        setTimeout(() => {
                            newSettingsContent.classList.add('show');
                        }, 50 * i);
                    });
                }
            }

            this.settingsInitialized = true;
        }

        // 加载完成后更新导航按钮状态
        this.updateNavigationButtons();
    }

    initSettingsHandlers() {
        // 添加'添加应用'按钮事件监听
        this.addAppButton.addEventListener('click', () => {
            this.addNewAppSettings();
        });

        // 设置按钮点击事件
        this.settingsButton.addEventListener('click', () => {
            this.toggleSettingsPage();
        });

        // 设置表单提交事件
        this.settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
            this.loadConversations();
        });

        // 添加主题选择器事件监听
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                document.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                e.target.classList.add('active');
                this.applyTheme(theme);
            });
        });

        // 更新主题选择器事件监听
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.applyTheme(theme);
            });
        });
    }

    applyTheme(theme) {
        const root = document.documentElement;
        const themeColors = {
            default: 'var(--theme-color-default)',
            blue: 'var(--theme-color-blue)',
            purple: 'var(--theme-color-purple)',
            red: 'var(--theme-color-red)',
            orange: 'var(--theme-color-orange)',
            green: 'var(--theme-color-green)',
            pink: 'var(--theme-color-pink)',
            yellow: 'var(--theme-color-yellow)',
            indigo: 'var(--theme-color-indigo)',
            cyan: 'var(--theme-color-cyan)',
            sky: 'var(--theme-color-sky)',
            lime: 'var(--theme-color-lime)',
            amber: 'var(--theme-color-amber)',
            emerald: 'var(--theme-color-emerald)',
            rose: 'var(--theme-color-rose)',
            fuchsia: 'var(--theme-color-fuchsia)'
        };

        root.style.setProperty('--primary-color', themeColors[theme]);

        // 更新主题选择器的激活状态
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === theme);
        });

        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
    }

    updateUserInfo() {
        this.userNameDisplay.textContent = this.userName;
        this.userAvatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${this.userName}`;
    }

    async saveSettings() {
        const userConfirmed = this.showInfoPage("设置已保存")
        const newUserName = document.getElementById('userNameInput').value.trim();

        if (newUserName) {
            this.userName = newUserName;
            localStorage.setItem('userName', newUserName);
            this.updateUserInfo();
        }

        // 保存主题设置
        localStorage.setItem('theme', this.currentTheme);

        const newApiKey = document.getElementById('apiKey').value.trim();
        const newBaseUrl = document.getElementById('baseUrl').value.trim();
        const newUserId = document.getElementById('userId').value.trim();

        if (!newApiKey || !newBaseUrl || !newUserId) {
            const userConfirmed = await this.showInfoPage("所有字段都必须填写")
            return;
        }

        // 保存到 localStorage
        localStorage.setItem('apiKey', newApiKey);
        localStorage.setItem('baseUrl', newBaseUrl);
        localStorage.setItem('userId', newUserId);

        // 更新实例变量
        this.apiKey = newApiKey;
        this.baseUrl = newBaseUrl;
        this.user = newUserId;
    }

    typeWriter(text, element, speed = 50) {
        let i = 0;
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    toggleSettingsPage() {
        // 获取当前显示状态
        const isSettingsVisible = this.settingsPage.style.display === 'flex';
        if (!isSettingsVisible) {
            // 保存当前状态
            this.toggleSettingsStates = {
                chatContainer: {
                    display: this.chatContainer.style.display,
                    wasVisible: this.chatContainer.style.display === 'flex'
                },
                welcomePage: {
                    display: this.welcomePage.style.display,
                    wasVisible: this.welcomePage.style.display === 'flex'
                }
            };
            // 隐藏其他页面
            this.chatContainer.style.display = 'none';
            this.welcomePage.style.display = 'none';
            // 显示设置页面
            this.settingsPage.style.display = 'flex';
            // 加载设置
            this.loadSettings();
            // 更新主题选择器的激活状态
            document.querySelectorAll('.theme-option').forEach(option => {
                option.classList.toggle('active', option.dataset.theme === this.currentTheme);
            });
        } else {
            // 隐藏设置页面
            this.settingsPage.style.display = 'none';
            // 恢复之前的状态
            if (this.toggleSettingsStates) {
                if (this.toggleSettingsStates.chatContainer.wasVisible) {
                    this.chatContainer.style.display = 'flex';
                } else {
                    this.welcomePage.style.display = 'flex';
                }
            }
        }
    }

    addNewAppSettings() {
        this.appCount++;
        localStorage.setItem(`appCount`, this.appCount);
        const newSettingsContent = document.createElement('div');
        newSettingsContent.className = 'settings-content';

        // 获取主应用面板
        const mainSettings = this.settingsWrapper.querySelector('.main-settings');

        // 获取所有现有的子应用面板
        const appPanels = Array.from(this.settingsWrapper.children).filter(
            el => !el.classList.contains('main-settings')
        );

        // 根据应用数量决定添加到左侧还是右侧
        const isEven = appPanels.length % 2 === 0;

        if (isEven) {
            // 添加到右侧
            newSettingsContent.classList.add('right-app');
            // 找到主应用右侧的第一个面板（如果存在）
            const firstRightPanel = mainSettings.nextElementSibling;
            if (firstRightPanel) {
                this.settingsWrapper.insertBefore(newSettingsContent, firstRightPanel);
            } else {
                this.settingsWrapper.appendChild(newSettingsContent);
            }
        } else {
            // 添加到左侧
            newSettingsContent.classList.add('left-app');
            this.settingsWrapper.insertBefore(newSettingsContent, mainSettings);
        }

        newSettingsContent.innerHTML = `
            <div class="app-title">
                <h3>应用 ${this.appCount}</h3>
                <button class="remove-app" onclick="chatApp.removeAppSettings(this)">删除</button>
            </div>
            <form class="settings-form">
                <div class="form-group">
                    <label for="apiKey${this.appCount}">API Key</label>
                    <input type="text" id="apiKey${this.appCount}" name="apiKey" required>
                </div>
                <div class="form-group">
                    <label for="baseUrl${this.appCount}">Base URL</label>
                    <input type="url" id="baseUrl${this.appCount}" name="baseUrl" required>
                </div>
                <button type="submit" class="save-button">保存设置</button>
            </form>
        `;

        // 为新表单添加提交事件处理
        const form = newSettingsContent.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAppSettings(form, this.appCount);
        });

        // 添加动画效果
        setTimeout(() => {
            newSettingsContent.classList.add('show');
            // 自动滚动到新添加的面板
            this.scrollToPanel(newSettingsContent);
        }, 50);

        // 更新导航按钮状态
        this.updateNavigationButtons();
    }

    removeAppSettings(button) {
        const settingsContent = button.closest('.settings-content');
        settingsContent.classList.remove('show');

        setTimeout(() => {
            const isLastPanel = !settingsContent.nextElementSibling;
            const targetPanel = isLastPanel ?
                settingsContent.previousElementSibling :
                settingsContent.nextElementSibling;

            settingsContent.remove();
            this.appCount--;
            localStorage.setItem(`appCount`, this.appCount);

            // 重新排列剩余的应用设置
            const appSettings = Array.from(this.settingsWrapper.children).filter(
                el => !el.classList.contains('main-settings')
            );

            appSettings.forEach((app, index) => {
                app.classList.remove('left-app', 'right-app');
                if (index % 2 === 0) {
                    app.classList.add('left-app');
                } else {
                    app.classList.add('right-app');
                }
            });
            // 更新导航按钮状态
            this.updateNavigationButtons();
            // 滚动到相邻面板
            if (targetPanel) {
                this.scrollToPanel(targetPanel);
            }
        }, 300);

        // 清除存储的数据
        localStorage.removeItem(`apiKey_${this.appCount}`);
        localStorage.removeItem(`baseUrl_${this.appCount}`);
    }

    saveAppSettings(form, appIndex) {
        // 保存特定应用的设置
        const apiKey = form.querySelector(`#apiKey${appIndex}`).value;
        const baseUrl = form.querySelector(`#baseUrl${appIndex}`).value;

        // 验证输入
        if (!apiKey || !baseUrl) {
            this.showInfoPage("API Key 和 Base URL 都不能为空");
            return;
        }

        // 保存到 localStorage
        localStorage.setItem(`apiKey_${appIndex}`, apiKey);
        localStorage.setItem(`baseUrl_${appIndex}`, baseUrl);
        localStorage.setItem(`modelType_${appIndex}`, "dify");

        // 获取应用名称并更新标题
        this.getAppInfo(apiKey).then(() => {
            const appName = this.appNameForApiKey.get(apiKey);
            // 找到当前表单所在的 settings-content
            const settingsContent = form.closest('.settings-content');
            const appTitle = settingsContent.querySelector('.app-title h3');
            if (appTitle) {
                appTitle.innerText = appName || `应用 ${appIndex}`;
            }
        });

        this.showInfoPage("应用设置已保存");
    }

    // 显示应用选择器
    async showAppSelector() {
        try {
            // 获取所有应用信息
            const apps = await this.getAllApps();

            // 确保主应用名称已加载
            if (this.apiKey && !this.appNameForApiKey.has(this.apiKey)) {
                await this.getAppInfo(this.apiKey);
            }

            // 如果没有主应用也没有其他应用，显示提示
            if (!this.apiKey && apps.length === 0) {
                await this.showInfoPage("请先在设置中添加应用");
                return;
            }

            const appList = document.getElementById('appList');
            appList.innerHTML = ''; // 清空现有列表

            // 添加主应用（如果存在）
            if (this.apiKey && this.baseUrl) {
                const mainAppItem = this.createAppItem({
                    name: this.appNameForApiKey.get(this.apiKey) || '主应用',
                    apiKey: this.apiKey,
                    baseUrl: this.baseUrl,
                    isMain: true
                });
                appList.appendChild(mainAppItem);
            }

            // 添加其他应用
            apps.forEach(app => {
                const appItem = this.createAppItem(app);
                appList.appendChild(appItem);
            });

            // 显示弹窗
            this.appSelectModal.style.display = 'flex';
        } catch (error) {
            console.error('Error showing app selector:', error);
            await this.showInfoPage("加载应用列表失败，请重试");
        }
    }

    // 创建应用项
    createAppItem(app) {
        const div = document.createElement('div');
        div.className = 'app-item';
        if (app.isMain) {
            div.classList.add('main-app');
        }

        div.innerHTML = `
            <h4>${app.name || '未命名应用'}</h4>
            <div class="app-url">${app.baseUrl}</div>
            ${app.isMain ? '<div class="app-badge">主应用</div>' : ''}
        `;

        div.addEventListener('click', async () => {
            try {
                await this.selectApp(app);
                this.appSelectModal.style.display = 'none';
            } catch (error) {
                console.error('Error selecting app:', error);
                await this.showInfoPage("切换应用失败，请重试");
            }
        });

        return div;
    }

    // 获取所有应用信息
    async getAllApps() {
        const apps = [];
        for (let i = 2; i <= this.appCount; i++) {
            const apiKey = localStorage.getItem(`apiKey_${i}`);
            const baseUrl = localStorage.getItem(`baseUrl_${i}`);
            if (apiKey && baseUrl) {
                // 确保应用名称已加载
                if (!this.appNameForApiKey.has(apiKey)) {
                    await this.getAppInfo(apiKey);
                }
                apps.push({
                    name: this.appNameForApiKey.get(apiKey) || `应用 ${i}`,
                    apiKey,
                    baseUrl,
                    index: i
                });
            }
        }
        return apps;
    }

    // 选择应用
    async selectApp(app) {
        try {
            if (!app.isMain) {
                const mainAppSettings = {
                    apiKey: localStorage.getItem('apiKey'),
                    baseUrl: localStorage.getItem('baseUrl')
                };
                
                this.apiKey = app.apiKey;
                this.baseUrl = app.baseUrl;
                
                localStorage.setItem('apiKey', app.apiKey);
                localStorage.setItem('baseUrl', app.baseUrl);
                localStorage.setItem(`apiKey_${app.index}`, mainAppSettings.apiKey);
                localStorage.setItem(`baseUrl_${app.index}`, mainAppSettings.baseUrl);
                
                await this.getAppInfo(app.apiKey);
                await this.getAppInfo(mainAppSettings.apiKey);
                this.loadSettings();
            }
            
            // 更新应用名称显示
            await this.updateAppName();
            
            // 关闭应用选择器
            this.appSelectModal.style.display = 'none';
            
            // 开始新对话
            await this.startNewChat();
        } catch (error) {
            console.error('Error selecting app:', error);
            await this.showInfoPage("切换应用失败，请重试");
        }
    }

    copyMessage(messageContent) {
        try {
            // 获取内容容器中的HTML
            const contentContainer = messageContent;
            // 创建临时元素并复制HTML内容
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = contentContainer.innerHTML;

            // 获取处理后的HTML内容
            const htmlContent = tempDiv.innerHTML;

            // 创建一个blob对象
            const blob = new Blob([htmlContent], { type: 'text/html' });

            // 创建ClipboardItem对象
            const data = new ClipboardItem({
                'text/html': blob
            });

            // 写入剪贴板
            navigator.clipboard.write([data]).then(() => {
                const copyBtn = document.querySelector('.message-actions .copy-btn');
                if (copyBtn) {
                    copyBtn.classList.add('copy-success');
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
                    setTimeout(() => {
                        copyBtn.classList.remove('copy-success');
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制';
                        const messageActions = copyBtn.closest('.message-actions');
                        if (messageActions) {
                            messageActions.classList.remove('show');
                        }
                    }, 1000);
                }
            });
        } catch (error) {
            console.error('复制失败:', error);
            this.showInfoPage("复制失败，请重试");
        }
    }

    // 添加新方法来显示操作按钮
    showMessageActions(messageActions, x, y, messageContent) {
        // 隐藏所有其他的操作按钮
        document.querySelectorAll('.message-actions').forEach(actions => {
            if (actions !== messageActions) {
                actions.classList.remove('show');
            }
        });

        // 获取消息内容的位置信息
        const rect = messageContent.getBoundingClientRect();

        // 设置按钮位置在消息内容的右侧
        let posX = rect.right + 10; // 在消息右侧留出10px间距
        let posY = rect.top + (rect.height / 2); // 垂直居中对齐

        // 如果按钮会超出右边界，则显示在左侧
        if (posX + messageActions.offsetWidth > window.innerWidth) {
            posX = rect.left - messageActions.offsetWidth - 10;
        }

        // 设置按钮位置
        messageActions.style.left = `${posX}px`;
        messageActions.style.top = `${posY}px`;
        messageActions.classList.add('show');

        // 点击其他地方时隐藏按钮
        const hideActions = (e) => {
            if (!messageActions.contains(e.target) && !messageContent.contains(e.target)) {
                messageActions.classList.remove('show');
                document.removeEventListener('click', hideActions);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', hideActions);
        }, 0);
    }

    // 修改 updateAppName 方法
    async updateAppName() {
        try {
            const appInfo = await this.getAppInfo(this.apiKey);
            // 无论是否获取到应用信息，都显示标签
            this.appNameElements.forEach(element => {
                element.textContent = (appInfo && appInfo.name) || "未命名应用";
            });
            this.appTags.forEach(tag => {
                tag.style.display = 'flex';
            });
        } catch (error) {
            console.error('Error updating app name:', error);
            // 发生错误时显示默认名称
            this.appNameElements.forEach(element => {
                element.textContent = "未命名应用";
            });
            this.appTags.forEach(tag => {
                tag.style.display = 'flex';
            });
        }
    }
}

let chatApp;
document.addEventListener('DOMContentLoaded', () => {
    chatApp = new ChatApp();
});

