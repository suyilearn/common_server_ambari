'''
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
'''

from resource_management import *
from ambari_commons import OSConst
from ambari_commons.os_family_impl import OsFamilyFuncImpl, OsFamilyImpl

@OsFamilyFuncImpl(os_family=OsFamilyImpl.DEFAULT)
def hst_service(action='start'):
  import params
  if action == 'start':
    daemon_cmd = "hst start"
    no_op_test = format("ls {hst_pid_file} >/dev/null 2>&1 && ps -p `cat {zk_pid_file}` >/dev/null 2>&1")
    Execute(daemon_cmd, not_if=no_op_test)
  elif action == 'stop':
    daemon_cmd = "hst stop"
    rm_pid = format("rm -f {hst_pid_file}")
    Execute(daemon_cmd)
    Execute(rm_pid)

@OsFamilyFuncImpl(os_family=OSConst.WINSRV_FAMILY)
def hst_service(action='start'):
  import params
  if action == 'start':
    Service(params.hst_win_service_name, action="start")
  elif action == 'stop':
    Service(params.hst_win_service_name, action="stop")
