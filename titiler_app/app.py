from fastapi import FastAPI

from rio_tiler.colormap import cmap as default_cmap

from titiler.core.dependencies import create_colormap_dependency
from titiler.core.factory import TilerFactory
from titiler.mosaic.factory import MosaicTilerFactory
from cogeo_mosaic.backends import MosaicBackend
from fastapi.middleware.cors import CORSMiddleware


def interpolate_colourmap(stops):

    keys = sorted(stops.keys())
    colourmap = {}

    for i in range(len(keys) - 1):

        start = keys[i]
        end = keys[i + 1]

        start_colour = stops[start]
        end_colour = stops[end]

        for value in range(start, end + 1):

            t = (value - start) / (end - start)

            r = round(
                start_colour[0] +
                t * (end_colour[0] - start_colour[0])
            )

            g = round(
                start_colour[1] +
                t * (end_colour[1] - start_colour[1])
            )

            b = round(
                start_colour[2] +
                t * (end_colour[2] - start_colour[2])
            )

            colourmap[value] = (r, g, b, 255)

    return colourmap

# --------------------------------------------------------------------------
# CMV LiDAR colourmap
# --------------------------------------------------------------------------

CMV_LIDAR_STOPS = {
    0:   (8, 81, 156, 255),
    12:  (33, 113, 181, 255),
    23:  (158, 202, 225, 255),
    35:  (222, 235, 247, 255),
    46:  (247, 251, 255, 255),
    52:  (255, 243, 196, 255),
    58:  (254, 227, 145, 255),
    69:  (254, 196, 79, 255),
    81:  (232, 216, 120, 255),
    104: (200, 207, 121, 255),
    139: (159, 182, 125, 255),
    197: (179, 154, 106, 255),
    255: (140, 117, 84, 255),
}

CMV_LIDAR = interpolate_colourmap(
    CMV_LIDAR_STOPS
)

# Register the colourmap with rio-tiler/TiTiler
cmap = default_cmap.register({
    "cmv_lidar": CMV_LIDAR,
})

ColorMapParams = create_colormap_dependency(cmap)


# --------------------------------------------------------------------------
# TiTiler application
# --------------------------------------------------------------------------

app = FastAPI(title="CMV TiTiler")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standard COG endpoints
cog = TilerFactory(
    colormap_dependency=ColorMapParams,
)

app.include_router(
    cog.router,
    prefix="/cog",
)


# MosaicJSON endpoints
mosaic = MosaicTilerFactory(
    backend=MosaicBackend,
    colormap_dependency=ColorMapParams,
)

app.include_router(
    mosaic.router,
    prefix="/mosaicjson",
)