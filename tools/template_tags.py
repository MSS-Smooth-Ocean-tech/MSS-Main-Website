from datetime import datetime
from pathlib import Path # import os

def get_certificate_status():
    # return datetime.now() < datetime(2026, 11, 1)
    return True # Keeping True for Now cause we are Using `get_certificate_images` to check the status.


def get_certificate_images():
    CERT_PATH = Path("./static/img/certificates")
    def is_active(value):
        return (
            value if isinstance(value, bool)
            else value > datetime.now() if isinstance(value, datetime)
            else False
        )

    certificates = [
        {"image": "iso2013.png", "name": "ISO 27001", "active": datetime(2026, 11, 1)},
        {"image": "iso2015.png", "name": "ISO 9001", "active": datetime(2026, 11, 1)},
        {"image": "iaf.png", "name": "IAF", "active": datetime(2026, 11, 1)},
        {"image": "anab.png", "name": "ANAB", "active": datetime(2026, 11, 1)},
        {"image": "dpiit.png", "name": "DPIIT Recognized Startup", "active": True},
        {"image": "nmcc_kanuur.png", "name": "NMCC Kannur", "active": True},
        {"image": "kerala_sum.jpg", "name": "Kerala Startup Mission", "active": True},
    ]

    return [
        cert for cert in certificates
        if (CERT_PATH / cert["image"]).exists() and is_active(cert["active"])
    ]