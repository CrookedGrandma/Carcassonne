import Downloader from "nodejs-file-downloader";

export async function download(url: string, subfolder: string = "imgs") {
    const downloader = new Downloader({
        url,
        directory: `data/${subfolder}`,
    });
    try {
        await downloader.download();
        console.log("All done");
    } catch (error) {
        console.log("Download failed", error);
    }
}
