#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, pwd, grp, signal, time, glob
from resource_management import *


class Master(Script):
    # 安装软件包
    def install(self, env):
        import params
        import status_params

        stable_package = params.tomcat_download_url

        self.install_packages(env)
        self.create_linux_user(params.tomcat_user, params.tomcat_group)
        if params.tomcat_user != 'root':
            Execute('cp /etc/sudoers /etc/sudoers.bak')
            Execute('echo "' + params.tomcat_user + ' ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers')
            Execute('echo Creating ' + params.tomcat_log_dir + ' ' + status_params.tomcat_pid_dir)

        Directory([status_params.tomcat_pid_dir, params.tomcat_log_dir],
                  owner=params.tomcat_user,
                  group=params.tomcat_group,
                  recursive=True
                  )
        Execute('touch ' + params.tomcat_log_file, user=params.tomcat_user)
        Execute('rm -rf ' + params.tomcat_dir, ignore_failures=True)
        Execute('rm ' + params.temp_file, ignore_failures=True)
        Execute('mkdir -p ' + params.tomcat_dir)
        Execute('chown -R ' + params.tomcat_user + ':' + params.tomcat_group + ' ' + params.tomcat_dir)
        Execute('echo Installing pachages')

        if not os.path.exists(params.temp_file):
            Execute('wget ' + stable_package + ' -O ' + params.temp_file + ' -a ' + params.tomcat_log_file,
                    user=params.tomcat_user)
        Execute(
            'tar xvf ' + params.temp_file + ' -C ' + params.tomcat_install_dir + '/' + params.tomcat_dirname + ' --strip-components=1 >> ' + params.tomcat_log_file,
            user=params.tomcat_user)
        Execute('rm ' + params.temp_file)
        self.configure(env)

    # 创建用户
    def create_linux_user(self, user, group):
        try:
            pwd.getpwnam(user)
        except KeyError:
            Execute('adduser ' + user)
        try:
            grp.getgrnam(group)
        except KeyError:
            Execute('groupadd ' + group)

    # 设置软件所需配置文件名称内容等
    def configure(self, env):
        import params
        import status_params
        env.set_params(params)
        env.set_params(status_params)

        self.set_conf_bin(env)

        tomcat_catalina_policy = InlineTemplate(params.tomcat_catalina_policy_content)

        File(format("{params.conf_dir}/catalina.policy"), content=tomcat_catalina_policy, owner=params.tomcat_user,
             group=params.tomcat_group)

        tomcat_catalina_properties = InlineTemplate(params.tomcat_catalina_properties_content)

        File(format("{params.conf_dir}/catalina.properties"), content=tomcat_catalina_properties,
             owner=params.tomcat_user,
             group=params.tomcat_group)

        tomcat_context_xml = InlineTemplate(params.tomcat_context_xml_content)

        File(format("{params.conf_dir}/context.xml"), content=tomcat_context_xml,
             owner=params.tomcat_user,
             group=params.tomcat_group)

        tomcat_logging_properties = InlineTemplate(params.tomcat_logging_properties_content)

        File(format("{params.conf_dir}/logging.properties"), content=tomcat_logging_properties,
             owner=params.tomcat_user,
             group=params.tomcat_group)

        tomcat_server_xml = InlineTemplate(params.tomcat_server_xml_content)

        File(format("{params.conf_dir}/server.xml"), content=tomcat_server_xml,
             owner=params.tomcat_user,
             group=params.tomcat_group)

        tomcat_tomcat_users_xml = InlineTemplate(params.tomcat_tomcat_users_xml_content)

        File(format("{params.conf_dir}/tomcat-users.xml"), content=tomcat_tomcat_users_xml,
             owner=params.tomcat_user,
             group=params.tomcat_group)

        tomcat_web_xml = InlineTemplate(params.tomcat_web_xml_content)

        File(format("{params.conf_dir}/web.xml"), content=tomcat_web_xml,
             owner=params.tomcat_user,
             group=params.tomcat_group)

    # 停止服务
    def stop(self, env):
        import params
        import status_params

        self.set_conf_bin(env)
        Execute(params.bin_dir + '/shutdown.sh >>' + params.tomcat_log_file, user=params.tomcat_user)
        Execute('rm ' + status_params.tomcat_pid_file)

    # 启动服务
    def start(self, env):
        import params
        import status_params
        self.configure(env)

        self.set_conf_bin(env)

        Execute('touch ' + params.tomcat_lock_file)
        Execute('chown ' + params.tomcat_user + ':' + params.tomcat_group + ' ' + params.tomcat_lock_file)
        Execute(params.bin_dir + '/startup.sh >> ' + params.tomcat_log_file, user=params.tomcat_user)
        Execute('mkdir -p ' + status_params.tomcat_pid_dir)
        Execute('chown -R ' + params.tomcat_user + ':' + params.tomcat_group + ' ' + status_params.tomcat_pid_dir)
        Execute('ps -ef | grep -i tomcat | awk {\'print $2\'} | head -n 1 > ' + status_params.tomcat_pid_file,
                user=params.tomcat_user)

    # 检查状态查看进程是否存活
    def status(self, env):
        import status_params
        check_process_status(status_params.tomcat_pid_file)

    # 设置conf和bin目录
    def set_conf_bin(self, env):
        import params
        params.conf_dir = os.path.join(*[params.tomcat_install_dir, params.tomcat_dirname, 'conf'])
        params.bin_dir = os.path.join(*[params.tomcat_install_dir, params.tomcat_dirname, 'bin'])


if __name__ == "__main__":
    Master().execute()
