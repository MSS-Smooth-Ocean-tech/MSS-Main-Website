from datetime import datetime
import os

def get_certificate_status():
    return datetime.now() < datetime(2026, 11, 1)

def get_certificate_images():
    order = [
        {"image": "iso2013.png", "name": "ISO 27001"},
        {"image": "iso2015.png", "name": "ISO 9001"},
        {"image": "dpiit.png", "name": "DPIIT Recognized Startup"},
        {"image": "iaf.png", "name": "IAF"},
        {"image": "anab.png", "name": "ANAB"}
    ]
    final_order = [
        i for i in order if os.path.exists(f"./static/img/certificates/{i['image']}")
    ]
    return final_order
