name,
    phone,
    message: message || 'Khách hàng từ Chatbot',
        source: 'CHATBOT',
            },
        })
return JSON.stringify({ success: true, message: "Đã lưu thông tin liên hệ thành công." })
    } catch (error) {
    console.error('Create Lead Error:', error)
    return JSON.stringify({ success: false, error: "Không thể lưu thông tin." })
}
}
