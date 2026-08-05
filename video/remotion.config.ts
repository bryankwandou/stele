import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Skala penuh; hasilnya dipakai untuk presentasi, jadi tidak boleh pecah.
Config.setScale(1);
