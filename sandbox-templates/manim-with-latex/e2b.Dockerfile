FROM manimcommunity/manim:stable

USER root

RUN apt-get update && apt-get install -y ffmpeg && apt-get clean && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y biber latexmk texlive-latex-base texlive-latex-recommended texlive-extra-utils && apt-get clean && rm -rf /var/lib/apt/lists/*
