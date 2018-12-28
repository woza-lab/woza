# woza (我砸)

Dump application ipa from jailbroken iOS based on frida. 

*woza is a nodejs version for [frida-ios-dump](https://github.com/AloneMonkey/frida-ios-dump)*

# Install

```
// 1. node >= v8.11.4
// 2. 
npm install -g woza
```

## Environment

1. frida

Jailbroken iOS need `frida` installed. [How to install frida](https://www.frida.re/docs/ios/#with-jailbreak)

2. password-free ssh

```
ssh-copy-id -i ~/.ssh/id_rsa root@ip -P 22
```

3. usbmuxd

```
brew install usbmuxd
```

4. iproxy

```
iproxy 2222 22
```

## Usage

1. find app bundle id

```
woza
```

2. start to dump

```
woza com.xxx.bundleid

// or 

woza com.xxx.bundleid ~/Desktop/xxx.ipa
```

## Help

```
List applications : woza
Dump application  : woza com.xxx.bundleid
                    woza com.xxx.bundleid ~/Desktop/xxx.ipa
Help              : woza --help
```

## Develop

```
npm run cli
npm run cli -- --help
npm run cli -- com.xxx.bundleid
npm run cli -- com.xxx.bundleid ~/Desktop/xxx.ipa
```

## Thanks

- [frida-ios-dump](https://github.com/AloneMonkey/frida-ios-dump)

## Group

关注订阅号`this很有趣`，回复 woza 进群反馈问题。

![bukuzao](https://everettjf.github.io/images/fun.jpg)

