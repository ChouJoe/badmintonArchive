export async function resolveCloudUrl(fileID) {
  if (!fileID) return ''
  if (!fileID.startsWith('cloud://')) return fileID
  try {
    const r = await uniCloud.getTempFileURL({ fileList: [fileID] })
    const url = r.fileList?.[0]?.tempFileURL
    if (url && !url.startsWith('cloud://')) return url
  } catch (e) {
    console.error('getTempFileURL failed:', e)
  }
  const match = fileID.match(/^cloud:\/\/([^/]+)\/(.+)$/)
  if (match) {
    return `https://${match[1]}.normal.cloudstatic.cn/${match[2]}`
  }
  return ''
}

export async function resolveCloudUrls(fileIDs) {
  const result = {}
  const unique = [...new Set(fileIDs.filter(f => f && f.startsWith('cloud://')))]
  if (unique.length === 0) return result
  try {
    const r = await uniCloud.getTempFileURL({ fileList: unique })
    for (const item of r.fileList) {
      if (item.tempFileURL && !item.tempFileURL.startsWith('cloud://')) {
        result[item.fileID] = item.tempFileURL
      }
    }
  } catch (e) {
    console.error('getTempFileURL batch failed:', e)
  }
  for (const fd of unique) {
    if (!result[fd]) {
      const match = fd.match(/^cloud:\/\/([^/]+)\/(.+)$/)
      if (match) {
        result[fd] = `https://${match[1]}.normal.cloudstatic.cn/${match[2]}`
      }
    }
  }
  return result
}