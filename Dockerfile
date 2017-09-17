FROM hypriot/rpi-node:8.1-slim

ENV DEBIAN_FRONTEND noninteractive

#required for alsa-playback (aplay)
RUN apt-get update \
	&& apt-get upgrade -y \
	&& apt-get install -y \
		libasound2 \
		alsa-utils \
		gstreamer1.0-alsa \
		gstreamer1.0-plugins-bad \
		gstreamer1.0-plugins-base \
		gstreamer1.0-plugins-good \
		gstreamer1.0-plugins-ugly \
		gst123
#cleanup
RUN apt-get clean \
	&& rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN useradd -mU node \
	&& usermod -a -G audio node

RUN mkdir /app /data
ADD . /app/
RUN chown node:node -R /app /data
USER node
WORKDIR /app

RUN npm install
RUN npm run build


VOLUME /data
EXPOSE 8080

#must mount /dev/snd
#must mount media lib (ro)
#should bind volume with settings/DBs

CMD npm run start