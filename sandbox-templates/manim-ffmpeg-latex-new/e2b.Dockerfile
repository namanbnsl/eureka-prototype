FROM manimcommunity/manim:stable

USER root

RUN apt-get update && apt-get install -y \
    ffmpeg \
    latexmk \
    dvisvgm \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-science \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*
