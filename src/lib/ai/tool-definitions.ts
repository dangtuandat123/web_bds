// Tool definitions for AI Agent
// These schemas define what tools the AI can call and their parameters

export const toolDefinitions = [
    {
        type: "function",
        function: {
            name: "search_properties",
            description: "Tìm kiếm bất động sản (dự án, căn hộ, nhà đất) theo yêu cầu của khách hàng. Gọi tool này khi khách hỏi về BĐS, căn hộ, nhà, đất, dự án.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Câu truy vấn tìm kiếm, ví dụ: 'căn hộ 2PN quận 2', 'biệt thự Thảo Điền', 'dự án Vinhomes'"
                    },
                    limit: {
                        type: "number",
                        description: "Số lượng kết quả tối đa, mặc định 5"
                    }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "save_customer_info",
            description: "Lưu thông tin liên hệ của khách hàng vào hệ thống. Gọi tool này khi khách để lại số điện thoại, email hoặc tên để được tư vấn.",
            parameters: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Họ tên khách hàng"
                    },
                    phone: {
                        type: "string",
                        description: "Số điện thoại khách hàng"
                    },
                    email: {
                        type: "string",
                        description: "Email khách hàng (không bắt buộc)"
                    },
                    message: {
                        type: "string",
                        description: "Ghi chú về nhu cầu của khách"
                    }
                },
                required: ["phone"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_project_detail",
            description: "Lấy thông tin chi tiết của một dự án cụ thể. Gọi tool này khi khách hỏi sâu về một dự án mà bạn đã tìm được.",
            parameters: {
                type: "object",
                properties: {
                    slug: {
                        type: "string",
                        description: "Slug của dự án, ví dụ: 'vinhomes-grand-park'"
                    }
                },
                required: ["slug"]
            }
        }
    }
]

export type ToolCall = {
    id: string
    type: "function"
    function: {
        name: string
        arguments: string
    }
}
