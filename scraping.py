import requests
from bs4 import BeautifulSoup
import streamlit as st
from datetime import timedelta

import re

def formatter_state_name(name):
    return str(re.sub("[\(\[].*?[\)\]]", "", name)).strip()

def formatter_state_tax(value):
    return float(value.replace('%', '').strip())

def formatter_spread_value(value):
    if 'Zero' in value:
        return 0
    return float(value.split('%')[0].replace(',', '.'))

def get_website_from_request(url):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'}
    response = requests.get(url, headers=headers)
    return BeautifulSoup(response.content, "html.parser")

def get_banks_spread_data():
    BANKS_SPREAD_URL = 'https://pontospravoar.com/taxas-banco-cobra-compras-exterior-usando-cartao-credito/'
    soup = get_website_from_request(BANKS_SPREAD_URL)
    soup = soup.find('article')
    h4 = soup.find_all('h4')
    del h4[-1]
    ul = soup.find_all('ul', {'class': ''})
    del ul[-1]
    data = {}
    for i in range(len(h4)):
        for j in ul[i].find_all('li'):
            data[j.text] = formatter_spread_value(h4[i].text)
    return data

def get_usa_tax_data():
    USA_TAX_URL = 'https://taxfoundation.org/data/all/state/2023-sales-tax-rates-midyear/'
    soup = get_website_from_request(USA_TAX_URL)
    data = {}
    table = soup.find_all('tr')
    for row in table:
        col = row.find_all('td')
        if col:
            data[formatter_state_name(col[0].text)] = formatter_state_tax(col[4].text)
    return data

@st.cache_resource(ttl=timedelta(minutes=10), show_spinner=False)
def get_dollar_data():
    DOLLAR_SOURCE_URL = 'https://valor.globo.com/valor-data/'
    soup = get_website_from_request(DOLLAR_SOURCE_URL)
    div = soup.find('div', {'class': 'valor-data__components-container'})
    tax_name = div.find_all('div', {'class': 'data-cotacao__ticker_name'})
    tax_value = div.find_all('div', {'class': 'data-cotacao__ticker_quote'})
    data = {}
    for i in range(len(tax_name)):
        data[tax_name[i].text] = float(str(tax_value[i].text.replace(',', '.')))
    return data