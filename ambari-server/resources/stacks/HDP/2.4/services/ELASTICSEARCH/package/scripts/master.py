import sys, os, pwd, grp,signal, time, glob
from resource_management import *
from subprocess import call

reload(sys)
sys.setdefaultencoding('utf8')

class Master(Script):
    def install(self, env):

        import params
        import status_params

        snapshot_package = 'http://10.128.7.245/oneapm/elasticsearch-2.1.1.zip'

        self.create_linux_user(params.es_user, params.es_group)
        if params.es_user != 'root':
            Execute('cp /etc/sudoers /etc/sudoers.bak')
            Execute('echo "' + params.es_user + '    ALL=(ALL)       NOPASSWD: ALL" >> /etc/sudoers')
            Execute('echo Creating ' + params.es_log_dir + ' ' + status_params.es_pid_dir)

        Directory([status_params.es_pid_dir, params.es_log_dir],
                  owner=params.es_user,
                  group=params.es_group,
                  recursive=True
                  )

        Execute('touch ' + params.es_log_file, user=params.es_user)
        Execute('rm -rf ' + params.es_dir, ignore_failures=True)
        Execute('mkdir -p ' + params.es_dir)
        Execute('chown -R ' + params.es_user + ':' + params.es_group + ' ' + params.es_dir)

        Execute('echo Installing packages')

        if not os.path.exists(params.temp_file):
            Execute('wget ' + snapshot_package + ' -O ' + params.temp_file + ' -a ' + params.es_log_file,
                    user=params.es_user)

        Execute('unzip ' + params.temp_file + ' -d ' + params.es_install_dir + ' >> ' + params.es_log_file,
                user=params.es_user)

        self.configure(env, True)

    def create_linux_user(self, user, group):
        try:
            pwd.getpwnam(user)
        except KeyError:
            Execute('adduser ' + user)
        try:
            grp.getgrnam(group)
        except KeyError:
            Execute('groupadd ' + group)

    def configure(self, env, isInstall=False):
        import params
        import status_params
        env.set_params(params)
        env.set_params(status_params)

        self.set_conf_bin(env)

        es_properties = InlineTemplate(params.es_properties_content)

        File(format("{params.conf_dir}/elasticsearch.yml"), content=es_properties, owner=params.es_user,
             group=params.es_group)  # , mode=0777)

        es_logging = InlineTemplate(params.es_logging_content)

        File(format("{params.conf_dir}/logging.yml"), content=es_logging, owner=params.es_user,
             group=params.es_group)

    def stop(self, env):
        import params
        import status_params
        self.set_conf_bin(env)
        Execute('cat ' + status_params.es_pid_file + '|xargs kill >> ' + params.es_log_file, user=params.es_user)
        # Execute('rm ' + status_params.es_pid_file)

    def start(self, env):
        import params
        import status_params
        self.configure(env)
        self.set_conf_bin(env)
        Execute('echo pid file ' + status_params.es_pid_file)
        Execute(params.bin_dir + '/elasticsearch -d -p ' + status_params.es_pid_file + '>> ' + params.es_log_file,
                user=params.es_user)

        Execute('chown ' + params.es_user + ':' + params.es_group + ' ' + status_params.es_pid_file)

    def status(self, env):

        import status_params

        check_process_status(status_params.es_pid_file)


    def set_conf_bin(self, env):

        import params
        params.conf_dir = os.path.join(*[params.es_install_dir, params.es_dirname, 'config'])
        params.bin_dir = os.path.join(*[params.es_install_dir, params.es_dirname, 'bin'])


if __name__ == "__main__":
    Master().execute()
