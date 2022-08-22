import NodeID3 from 'node-id3';
import ytdl from 'ytdl-core';

import { isDirectory } from './utils';

import convertVideoToAudio from './convertVideoToAudio';
import downloadVideo from './downloadVideo';
import extractSongTags from './extractSongTags';
import getFilepaths from './getFilepaths';

interface Options {
  outputDir: string;
  getTags: boolean;
}

export default async function main(
  url: string,
  options: Options
): Promise<void> {
  if (!isDirectory(options.outputDir)) {
    throw new Error('Not a directory: ' + options.outputDir);
  }
  const videoInfo = await ytdl.getInfo(url).catch(() => {
    throw new Error('Unable to fetch info for video with URL: ' + url);
  });

  const filepaths = getFilepaths(
    videoInfo.videoDetails.title,
    options?.outputDir
  );
  await downloadVideo(videoInfo, filepaths.videoFile);
  convertVideoToAudio(filepaths.videoFile, filepaths.audioFile);

  if (options.getTags) {
    const songTags = await extractSongTags(videoInfo);
    NodeID3.write(songTags, filepaths.audioFile);
  }
}
