FROM manimcommunity/manim:stable

USER root
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN apt-get update && \
    apt-get install --no-install-recommends -y \
        biber \
        latexmk \
        texlive-full && \
        rm -rf /var/lib/apt/lists/*
