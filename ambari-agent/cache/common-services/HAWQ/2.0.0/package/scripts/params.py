"""
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

import os
import functools
from resource_management import Script
from resource_management.libraries.functions.default import default
from resource_management.libraries.resources.hdfs_resource import HdfsResource
from resource_management.libraries.resources.execute_hadoop import ExecuteHadoop
from resource_management.libraries.functions import get_kinit_path
from resource_management.libraries.functions import conf_select
try:
    from resource_management.libraries.functions import hdp_select as hadoop_select
except ImportError:
    from resource_management.libraries.functions import phd_select as hadoop_select


config = Script.get_config()


def __get_component_host(component):
  """
  Returns the first host where the given component is deployed, None if the component is not deployed
  """
  component_host = None
  if component in config['clusterHostInfo'] and len(config['clusterHostInfo'][component]) > 0:
    component_host = config['clusterHostInfo'][component][0]
  return component_host


hostname = config['hostname']

# Users and Groups
hdfs_superuser = config['configurations']['hadoop-env']['hdfs_user']
user_group = config['configurations']['cluster-env']['user_group']

# Convert hawq_password to unicode for crypt() function in case user enters a numeric password
hawq_password = unicode(config['configurations']['hawq-env']['hawq_password'])


# HAWQ Hostnames
hawqmaster_host = __get_component_host('hawqmaster_hosts')
hawqstandby_host = __get_component_host('hawqstandby_hosts')
hawqsegment_hosts = default('/clusterHostInfo/hawqsegment_hosts', [])
hawq_master_hosts = [host for host in hawqmaster_host, hawqstandby_host if host]
hawq_all_hosts = set(hawq_master_hosts + hawqsegment_hosts)


# HDFS
hdfs_site = config['configurations']['hdfs-site']
default_fs = config['configurations']['core-site']['fs.defaultFS']

security_enabled = config['configurations']['cluster-env']['security_enabled']
hdfs_user_keytab = config['configurations']['hadoop-env']['hdfs_user_keytab']
kinit_path_local = get_kinit_path(default('/configurations/kerberos-env/executable_search_paths', None))
hdfs_principal_name = config['configurations']['hadoop-env']['hdfs_principal_name']
hadoop_conf_dir = conf_select.get_hadoop_conf_dir()
hadoop_bin_dir = hadoop_select.get_hadoop_dir("bin")
execute_path = os.environ['PATH'] + os.pathsep + hadoop_bin_dir

# HDFSResource partial function
HdfsResource = functools.partial(HdfsResource,
                                 user=hdfs_superuser,
                                 security_enabled=security_enabled,
                                 keytab=hdfs_user_keytab,
                                 kinit_path_local=kinit_path_local,
                                 principal_name=hdfs_principal_name,
                                 hdfs_site=hdfs_site,
                                 default_fs=default_fs)

# ExecuteHadoop partial function
ExecuteHadoop = functools.partial(ExecuteHadoop,
                                  user=hdfs_superuser,
                                  logoutput=True,
                                  conf_dir=hadoop_conf_dir,
                                  security_enabled=security_enabled,
                                  kinit_path_local=kinit_path_local,
                                  keytab=hdfs_user_keytab,
                                  principal=hdfs_principal_name,
                                  bin_dir=execute_path)

# YARN
# Note: YARN is not mandatory for HAWQ. It is required only when the users set HAWQ to use YARN as resource manager
rm_host = __get_component_host('rm_host')
yarn_ha_enabled = default('/configurations/yarn-site/yarn.resourcemanager.ha.enabled', False)

# Config files
gpcheck_content = config['configurations']['gpcheck-env']['content']
# database user limits
hawq_limits = config['configurations']['hawq-limits-env']
# sysctl parameters
hawq_sysctl = config['configurations']['hawq-sysctl-env']
# hawq config
hawq_site = config['configurations']['hawq-site']
# hdfs-client for enabling HAWQ to work with HDFS namenode HA
hdfs_client = config['configurations']['hdfs-client']
# yarn-client for enabling HAWQ to work with YARN resource manager HA
yarn_client = config['configurations']['yarn-client']


# Directories and ports
hawq_master_dir = hawq_site.get('hawq_master_directory')
hawq_segment_dir = hawq_site.get('hawq_segment_directory')
hawq_master_temp_dir = hawq_site.get('hawq_master_temp_directory')
hawq_segment_temp_dir = hawq_site.get('hawq_segment_temp_directory')
# Extract hawq hdfs directory from hdfs url. Ex: /hawq/hawq_default from
# host:8080/hawq/hawq_default
hawq_hdfs_data_dir = "/{0}".format(hawq_site.get('hawq_dfs_url').split('/', 1)[1])
hawq_master_address_port = hawq_site.get('hawq_master_address_port')
hawq_segment_address_port = hawq_site.get('hawq_segment_address_port')
