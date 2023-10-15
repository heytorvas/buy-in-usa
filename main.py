import streamlit as st
from scraping import get_dollar_data
from core import get_states_names, get_banks_names, post_calculate
import numpy as np

st.set_page_config(
    page_title="Comprar nos EUA",
    page_icon="🇺🇸",
)

st.markdown(f"""
        <style>
            div[data-testid="metric-container"] {{
                border: 1px solid #CCC;
                padding: 5% 5% 5% 10%;
                border-radius: 5px;
                border-left: 0.5rem solid #9AD8E1 !important;
            }}
            h2 {{
                text-align: center;
                font-size: 2rem;
            }}
            h3 {{
                text-align: center;
            }}
        </style>
        """, unsafe_allow_html=True)

st.header('💵 Comprar nos EUA 🇺🇸')

dollar = get_dollar_data()
col1, col2, col3 = st.columns([.5, .5, .5])
col1.metric('Dólar Comercial', dollar['Dólar Comercial'])
col2.metric('Dólar Turismo', dollar['Dólar Turismo'])
col3.metric('Dólar PTAX', dollar['Dólar PTAX'])

DEFAULT = 'Selecione uma opção...'

def selectbox_with_default(text, values, default=DEFAULT, sidebar=False):
    func = st.sidebar.selectbox if sidebar else st.selectbox
    return func(text, np.insert(np.array(values, object), 0, default))

with st.form("my_form"):
    price = st.number_input(
        label='Qual o valor em dólar?',
        format="%0.2f"
    )

    state = selectbox_with_default(
        'Qual estado americano?', 
        get_states_names()
    )

    bank = selectbox_with_default(
        'Qual banco é o seu cartão?', 
        sorted(get_banks_names())
    )
    
    submitted = st.form_submit_button("Calcular", type="secondary", use_container_width=True)


if submitted:
    if state == DEFAULT or bank == DEFAULT:
        st.warning("Selecione todos os campos!")
        raise st.stop()
    st.divider()
    st.subheader('Resultado')
    response = post_calculate(dollar, state, price, bank)
    col1, col2 = st.columns(2)
    col1.metric('Imposto Estadual', f'{response["state_tax"]}%')
    col2.metric('Valor em Dinheiro', f'R$ {response["cash"]}')
    col3, col4 = st.columns(2)
    col3.metric('Taxa Spread', f'{response["card_spread"]}%')
    col4.metric('Valor no Cartão', f'R$ {response["card"]}')
