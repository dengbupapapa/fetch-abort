## fetch-abort

###### 为web端fetch添加阻断功能（fetch-abort）

### 安装(install)
	npm i fetch-abort --save

### 使用(use)

	require('fetch-abor');
	
	//es
	import 'fetch-abort';

### abort


		let demo = fetch('/api');
    demo.abort()// 针对demo阻断(only demo abort)

    fetch.abort(abortNum=10)//所有阻断(all abort)

## Community

[github](https://github.com/dengbupapapa/fetch-abort)
[npm](https://www.npmjs.com/package/fetch-abort)