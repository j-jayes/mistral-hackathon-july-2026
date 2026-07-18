import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
// Crisper text for a screen-recorded / embedded demo.
Config.setChromiumOpenGlRenderer('angle');
