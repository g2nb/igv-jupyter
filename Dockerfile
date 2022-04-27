# Dockerfile for running igv-jupyter from a pip install

# Pull the latest known good scipy notebook image from the official Jupyter stacks
FROM jupyter/scipy-notebook:2022-02-17

MAINTAINER Thorin Tabor <tmtabor@cloud.ucsd.edu>
EXPOSE 8888

#############################################
##  $NB_USER                               ##
##      Install dependencies               ##
#############################################

RUN pip install nbtools==22.3.0b2 igv-notebook

#############################################
##  $NB_USER                               ##
##      Install nbtools igv-jupyter        ##
#############################################

RUN pip install igv-jupyter

# RUN git clone https://github.com/g2nb/igv-jupyter.git
# RUN cd igv-jupyter && pip install -e .

#############################################
##  $NB_USER                               ##
##      Add all example notebooks          ##
#############################################

RUN mkdir /home/jovyan/examples
COPY ./examples /home/jovyan/examples

#############################################
##  $NB_USER                               ##
##      Launch lab by default              ##
#############################################

ENV JUPYTER_ENABLE_LAB="true"
ENV TERM xterm
