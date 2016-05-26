#!/usr/bin/env python
# -*- coding: utf-8 -*-
from resource_management import *
import sys, os

config = Script.get_config()

tomcat_pid_dir = config['configurations']['tomcat-bootstrap-env']['tomcat_pid_dir']
tomcat_pid_file = tomcat_pid_dir + '/tomcat.pid'
