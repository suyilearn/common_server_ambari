### Ambari服务之Tomcat
在HDP技术堆栈上面通过Ambari服务用于快速安装和管理Tomcat,并进行监控.

#### 产品简介:
Tomcat是由Apache软件基金会下属的Jakarta项目开发的一个Servlet容器，按照Sun Microsystems提供的技术规范，实现了对Servlet和JavaServer Page（JSP）的支持，并提供了作为Web服务器的一些特有功能，如Tomcat管理和控制平台、安全域管理和Tomcat阀等。由于Tomcat本身也内含了一个HTTP服务器，它也可以被视作一个单独的Web服务器。但是，不能将Tomcat和Apache Web服务器混淆，Apache Web Server是一个用C语言实现的HTTP web server；这两个HTTP web server不是捆绑在一起的。Apache Tomcat包含了一个配置管理工具，也可以通过编辑XML格式的配置文件来进行配置。
**Tomcat官网**:http://tomcat.apache.org

#### 产品特点:
- 默认情况下, 通过下载onemapm的Ambari平台之后,即可通过Ambari平台一键安装Tomcat服务器. 
- Tomcat的配置文件在Ambari的UI平台上可以直接进行查看和配置.相关的文件如下:
Tomcat的属性文件
Tomcat的环境配置文件(你可以配置端口号,目录,安装目录,日志文件位置
- 通过这个平台的配置,你可以将对Tomcat服务器进行相关的常用操作,包括启动,停止,状态查看等相关操作


#### 局限性:

- 这不是一个官方提供的服务,但是可以进行相关的使用(已经进行严格的测试,证明可以进行使用)
- 它并不支持Ambari/HDP平台的升级,如果需要升级请先手动进行卸载,然后尝试手动进行升级.

#### 目录结构
- configuration 提供tomcat配置文件，以及一些安装信息的配置文件。
- package/scripts 主要功能脚本，实现界面化安装脚本。

#### 安装tomcat信息以及应用:
- tomcat的版本是7.0.55，tomcat详细用法[here](http://tomcat.apache.org/tomcat-8.0-doc/index.html)
##### 在已经存在的集群上进行Tomcat的部署

1.  首先已经安装ambari-server，ambari用法[here](https://cwiki.apache.org/confluence/display/AMBARI/Build+and+install+Ambari+2.2.1+from+Source)
2.  把插件目录放到/var/lib/ambari-server/resources/stacks/HDP/{HDP-version}/services下（插件目录名称需要全部大写）
    例如:修改为TOMCAT,并将相关的的插件目录至今存放到TOMCAT目录
3.  最后执行ambari-server setup,在执行ambari-server start 登陆当前ip和8080端口即可访问图形化界面，然后通过图形化界面配置安装信息.

#### 问题反馈:
 如有问题请联系sunyingyf@oneapm.com lifeiyf@oneapm.com

