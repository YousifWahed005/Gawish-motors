from pathlib import Path
from urllib.request import urlopen, Request
from concurrent.futures import ThreadPoolExecutor
photos={
 'hero-car':'photo-1503376780353-7e6692767b70',
 'electric-car':'photo-1560958089-b8a1929cea89',
 'petrol-car':'photo-1492144534655-ae79c964c9d7',
 'hybrid-car':'photo-1667551181687-e3eb9babf037',
 'offer-car':'photo-1503376780353-7e6692767b70',
 'story-car':'photo-1492144534655-ae79c964c9d7'
}
Path('public/images').mkdir(parents=True,exist_ok=True)
def download(item):
 name,photo=item
 url=f'https://images.unsplash.com/{photo}?auto=format&fit=crop&w=1600&q=85&fm=jpg'
 with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=60) as r:
  image=r.read()
 if not image.startswith(b'\xff\xd8'):raise ValueError(name+' is not JPEG')
 Path(f'public/images/{name}.jpg').write_bytes(image)
 print(name,len(image))
with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(download,photos.items()))
