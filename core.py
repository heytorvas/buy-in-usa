import json
from dynaconf import Dynaconf

settings = Dynaconf(settings_files=['settings.toml'])

def open_json_file(path):
    return json.load(open(path, 'r'))

def post_calculate(dollar, state, value, bank = None):
    state_tax = get_states()[state]
    cash = round((value + (value * state_tax / 100)) * (dollar['Dólar Turismo'] + (dollar['Dólar Turismo'] * settings.CASH_IOF / 100)), 2)
    response = {
        'value': value,
        'state': state,
        'state_tax': state_tax,
        'bank': bank,
        'cash': cash
    }
    if bank:
        card_spread = get_banks()[bank]
        response['card'] = round((value + (value * card_spread / 100)) * (dollar['Dólar PTAX'] + (dollar['Dólar PTAX'] * settings.CARD_IOF / 100)), 2)
        response['card_spread'] = card_spread
    return response

def get_states():
    return open_json_file("data/usa_tax.json")

def get_states_names():
    data = open_json_file("data/usa_tax.json")
    return [name for name in data]

def get_banks():
    return open_json_file("data/banks_spread.json")

def get_banks_names():
    data = open_json_file("data/banks_spread.json")
    return [name for name in data]