        async function saveAsImage() {
            const button = event.target;
            const originalText = button.textContent;
            
            try {
                button.textContent = '生成中...';
                button.disabled = true;
                window.scrollTo(0, 0);
                
                // 等待页面稳定
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // 截图前隐藏按钮
                const buttons = document.querySelector('.save-buttons');
                buttons.style.visibility = 'hidden';
                
                // 再次等待确保按钮完全隐藏
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const container = document.querySelector('.container');
                
                const canvas = await html2canvas(container, {
                    backgroundColor: '#ffffff',
                    scale: 1.5,
                    useCORS: true,
                    allowTaint: false,
                    imageTimeout: 10000,
                    removeContainer: false,
                    foreignObjectRendering: false,
                    logging: false,
                    width: container.offsetWidth,
                    height: container.offsetHeight,
                    x: 0,
                    y: 0,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight
                });
                
                buttons.style.visibility = 'visible';
                
                const link = document.createElement('a');
                const now = new Date();
                const filename = `TrendRadar_热点新闻分析_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.png`;
                
                link.download = filename;
                link.href = canvas.toDataURL('image/png', 1.0);
                
                // 触发下载
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                button.textContent = '保存成功!';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 2000);
                
            } catch (error) {
                const buttons = document.querySelector('.save-buttons');
                buttons.style.visibility = 'visible';
                button.textContent = '保存失败';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 2000);
            }
        }
        
        async function saveAsMultipleImages() {
            const button = event.target;
            const originalText = button.textContent;
            const container = document.querySelector('.container');
            const scale = 1.5; 
            const maxHeight = 5000 / scale;
            
            try {
                button.textContent = '分析中...';
                button.disabled = true;
                
                // 获取所有可能的分割元素
                const newsItems = Array.from(container.querySelectorAll('.news-item'));
                const wordGroups = Array.from(container.querySelectorAll('.word-group'));
                const newSection = container.querySelector('.new-section');
                const errorSection = container.querySelector('.error-section');
                const header = container.querySelector('.header');
                // 计算元素位置和高度
                const containerRect = container.getBoundingClientRect();
                const elements = [];
                
                // 添加header作为必须包含的元素
                elements.push({
                    type: 'header',
                    element: header,
                    top: 0,
                    bottom: header.offsetHeight,
                    height: header.offsetHeight
                });
                
                // 添加错误信息（如果存在）
                if (errorSection) {
                    const rect = errorSection.getBoundingClientRect();
                    elements.push({
                        type: 'error',
                        element: errorSection,
                        top: rect.top - containerRect.top,
                        bottom: rect.bottom - containerRect.top,
                        height: rect.height
                    });
                }
                
                // 按word-group分组处理news-item
                wordGroups.forEach(group => {
                    const groupRect = group.getBoundingClientRect();
                    const groupNewsItems = group.querySelectorAll('.news-item');
                    
                    // 添加word-group的header部分
                    const wordHeader = group.querySelector('.word-header');
                    if (wordHeader) {
                        const headerRect = wordHeader.getBoundingClientRect();
                        elements.push({
                            type: 'word-header',
                            element: wordHeader,
                            parent: group,
                            top: groupRect.top - containerRect.top,
                            bottom: headerRect.bottom - containerRect.top,
                            height: headerRect.height
                        });
                    }
                    
                    // 添加每个news-item
                    groupNewsItems.forEach(item => {
                        const rect = item.getBoundingClientRect();
                        elements.push({
                            type: 'news-item',
                            element: item,
                            parent: group,
                            top: rect.top - containerRect.top,
                            bottom: rect.bottom - containerRect.top,
                            height: rect.height
                        });
                    });
                });
                
                // 添加新增新闻部分
                if (newSection) {
                    const rect = newSection.getBoundingClientRect();
                    elements.push({
                        type: 'new-section',
                        element: newSection,
                        top: rect.top - containerRect.top,
                        bottom: rect.bottom - containerRect.top,
                        height: rect.height
                    });
                }
                
                // 计算分割点
                const segments = [];
                let currentSegment = { start: 0, end: 0, height: 0, includeHeader: true };
                let headerHeight = header.offsetHeight;
                currentSegment.height = headerHeight;
                
                for (let i = 1; i < elements.length; i++) {
                    const element = elements[i];
                    const potentialHeight = element.bottom - currentSegment.start;
                    
                    // 检查是否需要创建新分段
                    if (potentialHeight > maxHeight && currentSegment.height > headerHeight) {
                        // 在前一个元素结束处分割
                        currentSegment.end = elements[i - 1].bottom;
                        segments.push(currentSegment);
                        
                        // 开始新分段
                        currentSegment = {
                            start: currentSegment.end,
                            end: 0,
                            height: element.bottom - currentSegment.end,
                            includeHeader: false
                        };
                    } else {
                        currentSegment.height = potentialHeight;
                        currentSegment.end = element.bottom;
                    }
                }
                
                // 添加最后一个分段
                if (currentSegment.height > 0) {
                    currentSegment.end = container.offsetHeight;
                    segments.push(currentSegment);
                }
                
                button.textContent = `生成中 (0/${segments.length})...`;
                
                // 隐藏保存按钮
                const buttons = document.querySelector('.save-buttons');
                buttons.style.visibility = 'hidden';
                
                // 为每个分段生成图片
                const images = [];
                for (let i = 0; i < segments.length; i++) {
                    const segment = segments[i];
                    button.textContent = `生成中 (${i + 1}/${segments.length})...`;
                    
                    // 创建临时容器用于截图
                    const tempContainer = document.createElement('div');
                    tempContainer.style.cssText = `
                        position: absolute;
                        left: -9999px;
                        top: 0;
                        width: ${container.offsetWidth}px;
                        background: white;
                    `;
                    tempContainer.className = 'container';
                    
                    // 克隆容器内容
                    const clonedContainer = container.cloneNode(true);
                    
                    // 移除克隆内容中的保存按钮
                    const clonedButtons = clonedContainer.querySelector('.save-buttons');
                    if (clonedButtons) {
                        clonedButtons.style.display = 'none';
                    }
                    
                    tempContainer.appendChild(clonedContainer);
                    document.body.appendChild(tempContainer);
                    
                    // 等待DOM更新
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // 使用html2canvas截取特定区域
                    const canvas = await html2canvas(clonedContainer, {
                        backgroundColor: '#ffffff',
                        scale: scale,
                        useCORS: true,
                        allowTaint: false,
                        imageTimeout: 10000,
                        logging: false,
                        width: container.offsetWidth,
                        height: segment.end - segment.start,
                        x: 0,
                        y: segment.start,
                        windowWidth: window.innerWidth,
                        windowHeight: window.innerHeight
                    });
                    
                    images.push(canvas.toDataURL('image/png', 1.0));
                    
                    // 清理临时容器
                    document.body.removeChild(tempContainer);
                }
                
                // 恢复按钮显示
                buttons.style.visibility = 'visible';
                
                // 下载所有图片
                const now = new Date();
                const baseFilename = `TrendRadar_热点新闻分析_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
                
                for (let i = 0; i < images.length; i++) {
                    const link = document.createElement('a');
                    link.download = `${baseFilename}_part${i + 1}.png`;
                    link.href = images[i];
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // 延迟一下避免浏览器阻止多个下载
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                button.textContent = `已保存 ${segments.length} 张图片!`;
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 2000);
                
            } catch (error) {
                console.error('分段保存失败:', error);
                const buttons = document.querySelector('.save-buttons');
                buttons.style.visibility = 'visible';
                button.textContent = '保存失败';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 2000);
            }
        }
        
        document.addEventListener('DOMContentLoaded', function() {
            // 横向滚动时，滚动到最左边
            const contentWrapper = document.querySelector('.content');
            if (contentWrapper) {
                contentWrapper.scrollLeft = 0;
            }
            window.scrollTo(0, 0);
            
            // 将鼠标滚轮上下滚动转换为左右滚动（只监听 .content 本身，不包括子元素）
            const content = document.querySelector('.content');
            if (content) {
                // 鼠标滚轮滚动转换
                content.addEventListener('wheel', function(e) {
                    // 只有当事件目标就是 .content 本身，或者是在 .content-wrapper 上时才转换
                    // 如果是在 word-group 或 new-section 内部，则不处理，让它们正常上下滚动
                    const target = e.target;
                    const isInScrollableSection = target.closest('.word-group') || target.closest('.new-section');
                    
                    // 如果不在可滚动的 section 内部，则转换为水平滚动
                    if (!isInScrollableSection) {
                        // 阻止默认的垂直滚动
                        e.preventDefault();
                        
                        // 将垂直滚动转换为水平滚动
                        const delta = e.deltaY || e.deltaX;
                        this.scrollLeft += delta;
                    }
                }, { passive: false });
                
                // 鼠标长按拖动功能
                let isDragging = false;
                let startX = 0;
                let scrollLeft = 0;
                
                content.addEventListener('mousedown', function(e) {
                    const target = e.target;
                    const isInScrollableSection = target.closest('.word-group') || target.closest('.new-section');
                    
                    // 如果不在可滚动的 section 内部，且不是按钮，则允许拖拽
                    if (!isInScrollableSection && !target.closest('button')) {
                        isDragging = true;
                        startX = e.pageX - content.offsetLeft;
                        scrollLeft = content.scrollLeft;
                        content.style.cursor = 'grabbing';
                        content.style.userSelect = 'none';
                        e.preventDefault();
                    }
                });
                
                content.addEventListener('mousemove', function(e) {
                    if (!isDragging) return;
                    
                    const target = e.target;
                    const isInScrollableSection = target.closest('.word-group') || target.closest('.new-section');
                    
                    // 如果不在可滚动的 section 内部，则允许拖拽
                    if (!isInScrollableSection) {
                        e.preventDefault();
                        const x = e.pageX - content.offsetLeft;
                        const walk = (x - startX) * 2; // 拖动速度倍数
                        content.scrollLeft = scrollLeft - walk;
                    }
                });
                
                content.addEventListener('mouseup', function() {
                    if (isDragging) {
                        isDragging = false;
                        content.style.cursor = 'grab';
                        content.style.userSelect = '';
                    }
                });
                
                content.addEventListener('mouseleave', function() {
                    if (isDragging) {
                        isDragging = false;
                        content.style.cursor = 'grab';
                        content.style.userSelect = '';
                    }
                });
                
                // 设置初始鼠标样式
                content.style.cursor = 'grab';
            }
        });
