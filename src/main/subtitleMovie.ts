import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

interface Subtitles {
    startTime: string,
    endTime: string,
    text: string
}

// TODO: 環境変数から読み込む
const INPUT_VIDEO_PATH = 'input_video.mp4';
const OUTPUT_VIDEO_PATH = 'output.mp4';

export const createSubtitleMovie = (subtitles: Subtitles[], input_video_path=INPUT_VIDEO_PATH, output_video_path=OUTPUT_VIDEO_PATH) => {

    // ASSファイルのヘッダー情報
    const assHeader = `
    [Script Info]
    Title: Node.js Generated Subtitle
    ScriptType: v4.00

    [V4 Styles]
    Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
    Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,1,1.5,0,2,10,10,10,1

    [Events]
    Format: Marked, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
    `;

    // 字幕をASS形式にフォーマット
    const assBody = subtitles.map((subtitle) => {
        return `Dialogue: Marked=0,${subtitle.startTime},${subtitle.endTime},Default,,0,0,0,,${subtitle.text}`;
    }).join('\n');

    // 完全なASSファイル内容
    const assContent = assHeader + assBody;

    // ASSファイルを保存
    const assFilename = 'output.ass';
    fs.writeFileSync(assFilename, assContent, 'utf8');

    // fluent-ffmpegでASSファイルと動画を結合
    ffmpeg(input_video_path)
    .outputOptions('-vf', `ass=${assFilename}`) // 字幕フィルターを使ってASS字幕を追加
    .save(output_video_path) // 出力する動画ファイル
    .on('end', () => {
        console.log('字幕付き動画が正常に生成されました');
    })
    .on('error', (err) => {
        console.error('エラーが発生しました: ', err);
    });
}